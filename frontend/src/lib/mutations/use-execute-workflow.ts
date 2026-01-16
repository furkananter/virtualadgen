import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';

export const useExecuteWorkflow = () => {
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
