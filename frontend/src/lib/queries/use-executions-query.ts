import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

export const useExecutionsQuery = (workflowId: string | undefined) => {
    return useQuery({
        queryKey: ['executions', workflowId],
        queryFn: async () => {
            if (!workflowId) return [];

            const { data, error } = await supabase
                .from('executions')
                .select(`
                    *,
                    node_executions (*),
                    generations (*)
                `)
                .eq('workflow_id', workflowId)
                .order('started_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!workflowId,
    });
};
