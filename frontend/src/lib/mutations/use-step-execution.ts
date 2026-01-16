import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';

export const useStepExecution = () => {
    const queryClient = useQueryClient();
    const { currentExecution, setCurrentExecution, setIsExecuting } = useExecutionStore();
    const { setIsPaused } = useDebugStore();

    return useMutation({
        mutationFn: async () => {
            if (!currentExecution?.id) throw new Error('No active execution to step');
            setIsExecuting(true);
            const response = await workflowApi.step(currentExecution.id);
            return response;
        },
        onSuccess: (data) => {
            // @ts-expect-error - partial execution update
            setCurrentExecution({ ...currentExecution, status: data.status });
            queryClient.invalidateQueries({ queryKey: ['node-executions', currentExecution?.id] });

            if (data.status === 'FAILED') {
                toast.error(data.error_message || 'Workflow execution failed');
                setIsExecuting(false);
                setIsPaused(false);
                return;
            }

            if (data.status === 'COMPLETED') {
                toast.success('Workflow execution completed');
                setIsExecuting(false);
                setIsPaused(false);
            } else if (data.status === 'PAUSED') {
                toast.info('Workflow paused at next breakpoint');
                setIsExecuting(false);
                setIsPaused(true);
            }
        },
        onError: (error: Error) => {
            setIsExecuting(false);
            toast.error(`Step failed: ${error.message}`);
        }
    });
};
