import { supabase } from '@/config/supabase';

export interface DbNode {
    id: string;
    workflow_id: string;
    type: string;
    name: string;
    config: Record<string, unknown>;
    position_x: number;
    position_y: number;
    has_breakpoint: boolean;
}

/**
 * Get all nodes for a workflow.
 */
export const getNodesByWorkflowId = async (workflowId: string): Promise<DbNode[]> => {
    const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('workflow_id', workflowId);

    if (error) throw error;
    return data as DbNode[];
};

/**
 * Delete all nodes for a workflow.
 */
export const deleteNodesByWorkflowId = async (workflowId: string): Promise<void> => {
    const { error } = await supabase
        .from('nodes')
        .delete()
        .eq('workflow_id', workflowId);

    if (error) throw error;
};

/**
 * Insert multiple nodes.
 */
export const insertNodes = async (nodes: DbNode[]): Promise<void> => {
    if (nodes.length === 0) return;

    const { error } = await supabase
        .from('nodes')
        .insert(nodes);

    if (error) throw error;
};
