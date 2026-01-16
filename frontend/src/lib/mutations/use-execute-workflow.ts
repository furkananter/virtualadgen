import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';
import type { Execution } from '@/types/database';

export const useExecuteWorkflow = () => {
  const { setCurrentExecution } = useExecutionStore();
  const { setIsPaused } = useDebugStore();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      // Set initial RUNNING state
      setCurrentExecution({ status: 'RUNNING' } as Execution);
      const response = await workflowApi.execute(workflowId);
      return response;
    },
    onSuccess: (data) => {
      const partialExecution: Partial<Execution> & Pick<Execution, 'id' | 'status'> = {
        id: data.execution_id,
        status: data.status,
      };
      setCurrentExecution(partialExecution as Execution);

      if (data.status === 'PAUSED') {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    },
    onError: (error) => {
      setCurrentExecution(null);
      setIsPaused(false);
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};
