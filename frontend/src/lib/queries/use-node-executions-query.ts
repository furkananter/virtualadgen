import { useQuery } from '@tanstack/react-query';
import { getNodeExecutionsByExecutionId } from '@/lib/supabase';
import { useDebugStore } from '@/stores/debug-store';
import { useExecutionStore } from '@/stores/execution-store';
import { useEffect } from 'react';
import type { NodeExecution } from '@/types/database';

export const useNodeExecutionsQuery = (executionId: string | null) => {
    const { setNodeExecution } = useDebugStore();
    const { isExecuting } = useExecutionStore();

    const query = useQuery({
        queryKey: ['node-executions', executionId],
        queryFn: async (): Promise<NodeExecution[]> => {
            if (!executionId) return [];
            return await getNodeExecutionsByExecutionId(executionId);
        },
        enabled: !!executionId,
        refetchInterval: isExecuting() ? 500 : false,
    });

    // Sync to debug store when data changes
    useEffect(() => {
        if (query.data) {
            query.data.forEach((ne) => {
                setNodeExecution(ne.node_id, ne);
            });
        }
    }, [query.data, setNodeExecution]);

    return query;
};
