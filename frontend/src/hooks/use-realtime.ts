import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useDebugStore } from '@/stores/debug-store';
import { useExecutionStore } from '@/stores/execution-store';
import type { NodeExecution, Execution } from '@/types/database';

export const useRealtime = (executionId: string | null) => {
  const { setNodeExecution, setIsPaused } = useDebugStore();
  const { setCurrentExecution } = useExecutionStore();

  useEffect(() => {
    if (!executionId) return;

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
          console.log('✅ Connected to node executions channel');
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

          if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) {
            console.log(`Workflow finished with status: ${execution.status}`);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Connected to execution status channel');
        }
      });

    return () => {
      supabase.removeChannel(nodeChannel);
      supabase.removeChannel(execChannel);
    };
  }, [executionId, setNodeExecution, setIsPaused, setCurrentExecution]);
};
