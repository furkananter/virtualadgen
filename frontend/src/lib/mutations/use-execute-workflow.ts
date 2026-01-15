import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';

export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  const { setCurrentExecution, setIsExecuting } = useExecutionStore();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      setIsExecuting(true);
      const response = await workflowApi.execute(workflowId);
      return response;
    },
    onSuccess: (data) => {
      // @ts-ignore - database type vs api response
      setCurrentExecution({ id: data.execution_id, status: data.status });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
    },
    onError: () => {
      setIsExecuting(false);
    }
  });
};
