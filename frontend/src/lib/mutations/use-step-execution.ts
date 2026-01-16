import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';
import type { Execution } from '@/types/database';

export const useStepExecution = () => {
    const queryClient = useQueryClient();
    const { currentExecution, setCurrentExecution } = useExecutionStore();
    const { setIsPaused } = useDebugStore();

    return useMutation({
        mutationFn: async () => {
            const exec = currentExecution;
            const execId = exec?.id;
            if (!execId) throw new Error('No active execution to step');

            const response = await workflowApi.step(execId);
            return { data: response, exec, execId };
        },
        onSuccess: ({ data, exec, execId }) => {
            setCurrentExecution({ ...exec, status: data.status } as Execution);
            queryClient.invalidateQueries({ queryKey: ['node-executions', execId] });

            if (data.status === 'FAILED') {
                toast.error(data.error_message || 'Workflow execution failed');
                setIsPaused(false);
                return;
            }
            if (data.status === 'COMPLETED') {
                toast.success('Workflow execution completed');
                setIsPaused(false);
            } else if (data.status === 'PAUSED') {
                toast.info('Workflow paused at next breakpoint');
                setIsPaused(true);
            }
        },
        onError: (error: Error) => {
            toast.error(`Step failed: ${error.message}`);
        }
    });
};
