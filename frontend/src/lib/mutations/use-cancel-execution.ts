import { useMutation } from '@tanstack/react-query';
import { workflowApi } from '@/lib/api';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';

export const useCancelExecution = () => {
    const { currentExecution, clearExecution } = useExecutionStore();
    const { setIsPaused } = useDebugStore();

    return useMutation({
        mutationFn: async () => {
            if (!currentExecution?.id) throw new Error('No active execution to cancel');
            const response = await workflowApi.cancel(currentExecution.id);
            return response;
        },
        onSuccess: () => {
            clearExecution();
            setIsPaused(false);
            toast.info('Execution cancelled');
        },
        onError: (error: Error) => {
            toast.error(`Cancel failed: ${error.message}`);
        }
    });
};
