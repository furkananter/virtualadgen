import { useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useDebugStore } from '@/stores/debug-store';
import { NodeExecution } from '@/types/database';

export const useRealtime = (executionId: string | null) => {
  const { setNodeExecution } = useDebugStore();

  useEffect(() => {
    if (!executionId) return;

    const channel = supabase
      .channel(`execution-${executionId}`)
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [executionId, setNodeExecution]);
};
