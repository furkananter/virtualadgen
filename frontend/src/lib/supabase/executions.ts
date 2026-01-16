import { supabase } from '@/config/supabase';
import type { NodeExecution, Execution, Generation } from '@/types/database';

export interface ExecutionWithRelations extends Execution {
    node_executions: NodeExecution[];
    generations: Generation[];
}

/**
 * Get all executions for a workflow with related data.
 */
export const getExecutionsByWorkflowId = async (
    workflowId: string
): Promise<ExecutionWithRelations[]> => {
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
    return data as ExecutionWithRelations[];
};

/**
 * Get all node executions for an execution.
 */
export const getNodeExecutionsByExecutionId = async (
    executionId: string
): Promise<NodeExecution[]> => {
    const { data, error } = await supabase
        .from('node_executions')
        .select('*')
        .eq('execution_id', executionId);

    if (error) throw error;
    return data as NodeExecution[];
};
