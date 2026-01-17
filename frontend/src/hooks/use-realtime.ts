import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useDebugStore } from '@/stores/debug-store';
import { useExecutionStore } from '@/stores/execution-store';
import { getNodeExecutionsByExecutionId } from '@/lib/supabase';
import type { NodeExecution, Execution } from '@/types/database';

export const useRealtime = (executionId: string | null) => {
  const { setNodeExecution, setIsPaused, clearNodeExecutions } = useDebugStore();
  const { setCurrentExecution } = useExecutionStore();

  useEffect(() => {
    if (!executionId) return;

    let isActive = true;

    // Subscribe to node executions for live node updates (inspector, handles)
    const nodeChannel = supabase
      .channel(`node-executions-${executionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'node_executions',
          filter: `execution_id=eq.${executionId}`,
        },
        (payload) => {
          const nodeExecution = payload.new as NodeExecution;
          setNodeExecution(nodeExecution.node_id, nodeExecution);

          if (nodeExecution.status === 'PAUSED') {
            setIsPaused(true);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          getNodeExecutionsByExecutionId(executionId)
            .then((nodes) => {
              if (!isActive) return;
              nodes.forEach((nodeExecution) => {
                setNodeExecution(nodeExecution.node_id, nodeExecution);
                if (nodeExecution.status === 'PAUSED') {
                  setIsPaused(true);
                }
              });
            })
            .catch(() => {
              // Silently handle sync failures
            });
        }
      });

    // Subscribe to the execution record itself for status changes
    const execChannel = supabase
      .channel(`execution-status-${executionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'executions',
          filter: `id=eq.${executionId}`,
        },
        (payload) => {
          const execution = payload.new as Execution;
          setCurrentExecution(execution);

          // isPaused is still managed by debug store for step-through functionality
          if (execution.status === 'PAUSED') {
            setIsPaused(true);
          } else {
            setIsPaused(false);
          }

          if (execution.status === 'CANCELLED') {
            clearNodeExecutions();
          }

          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
            // Workflow finished
          }
        }
      )
      .subscribe();

    return () => {
      isActive = false;
      supabase.removeChannel(nodeChannel);
      supabase.removeChannel(execChannel);
    };
  }, [executionId, setNodeExecution, setIsPaused, setCurrentExecution, clearNodeExecutions]);
};
