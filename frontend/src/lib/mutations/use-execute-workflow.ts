import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';
import type { Execution, ExecutionStatus } from '@/types/database';

const TERMINAL_STATUSES: ExecutionStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];

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
      const partialExecution: Partial<Execution> & Pick<Execution, 'id' | 'status'> = {
        id: data.execution_id,
        status: data.status,
      };
      setCurrentExecution(partialExecution as Execution);

      if (data.status === 'PAUSED') {
        setIsExecuting(false);
        setIsPaused(true);
      } else if (TERMINAL_STATUSES.includes(data.status)) {
        setIsExecuting(false);
        setIsPaused(false);
      }
    },
    onError: (error) => {
      setIsExecuting(false);
      setIsPaused(false);
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};
