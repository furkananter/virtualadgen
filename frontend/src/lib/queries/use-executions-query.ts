import { useQuery } from '@tanstack/react-query';
import { getExecutionsByWorkflowId } from '@/lib/supabase';

export const useExecutionsQuery = (workflowId: string | undefined) => {
    return useQuery({
        queryKey: ['executions', workflowId],
        queryFn: async () => {
            if (!workflowId) return [];
            return await getExecutionsByWorkflowId(workflowId);
        },
        enabled: !!workflowId,
    });
};
