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
            // Capture snapshot before async operation
            const exec = currentExecution;
            const execId = exec?.id;
            if (!execId) throw new Error('No active execution to step');

            setIsExecuting(true);
            const response = await workflowApi.step(execId);
            // Return both response and captured snapshot
            return { data: response, exec, execId };
        },
        onSuccess: ({ data, exec, execId }) => {
            // Use captured snapshot for consistent state updates
            setCurrentExecution({ ...exec, status: data.status });
            queryClient.invalidateQueries({ queryKey: ['node-executions', execId] });

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

