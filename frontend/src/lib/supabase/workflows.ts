import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';
import { getCurrentUserId } from './auth';

/**
 * Get all workflows for current user, ordered by created_at desc.
 * Note: Supabase RLS policies enforce per-user access, so no explicit
 * user_id filter is needed here.
 */
export const getAllWorkflows = async (): Promise<Workflow[]> => {
    const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Workflow[];
};

/**
 * Get a single workflow by ID.
 */
export const getWorkflowById = async (id: string): Promise<Workflow | null> => {
    const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return data as Workflow;
};

/**
 * Create a new workflow.
 */
export const createWorkflow = async (workflow: Partial<Workflow>): Promise<Workflow> => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
        .from('workflows')
        .insert({ ...workflow, user_id: userId })
        .select()
        .single();

    if (error) throw error;
    return data as Workflow;
};

/**
 * Update a workflow by ID.
 */
export const updateWorkflow = async (id: string, updates: Partial<Workflow>): Promise<Workflow> => {
    const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Workflow;
};

/**
 * Delete a workflow by ID.
 */
export const deleteWorkflow = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

/**
 * Touch workflow updated_at timestamp.
 */
export const touchWorkflow = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('workflows')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
};
