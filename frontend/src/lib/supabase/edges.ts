import { supabase } from '@/config/supabase';

export interface DbEdge {
    id: string;
    workflow_id: string;
    source_node_id: string;
    target_node_id: string;
    source_handle?: string | null;
    target_handle?: string | null;
}

/**
 * Get all edges for a workflow.
 */
export const getEdgesByWorkflowId = async (workflowId: string): Promise<DbEdge[]> => {
    const { data, error } = await supabase
        .from('edges')
        .select('*')
        .eq('workflow_id', workflowId);

    if (error) throw error;
    return data as DbEdge[];
};

/**
 * Delete all edges for a workflow.
 */
export const deleteEdgesByWorkflowId = async (workflowId: string): Promise<void> => {
    const { error } = await supabase
        .from('edges')
        .delete()
        .eq('workflow_id', workflowId);

    if (error) throw error;
};

/**
 * Insert multiple edges.
 */
export const insertEdges = async (edges: DbEdge[]): Promise<void> => {
    if (edges.length === 0) return;

    const { error } = await supabase
        .from('edges')
        .insert(edges);

    if (error) throw error;
};
