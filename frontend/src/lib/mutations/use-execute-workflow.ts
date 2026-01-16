import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  const { setCurrentExecution, setIsExecuting } = useExecutionStore();
  const { setIsPaused } = useDebugStore();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      setIsExecuting(true);
      const response = await workflowApi.execute(workflowId);
      return response;
    },
    onSuccess: (data) => {
      // @ts-expect-error - partial execution shape for optimistic update
      setCurrentExecution({ id: data.execution_id, status: data.status });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['node-executions', data.execution_id] });

      // Backend runs synchronously, so when we get the response the execution is done
      if (data.status === 'PAUSED') {
        setIsExecuting(false);
        setIsPaused(true);
      } else if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
        setIsExecuting(false);
        setIsPaused(false);
      }
    },
    onError: () => {
      setIsExecuting(false);
      setIsPaused(false);
    }
  });
};
