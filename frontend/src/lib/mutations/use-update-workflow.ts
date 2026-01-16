import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';

interface UpdateWorkflowParams {
  workflowId: string;
  updates: Partial<Workflow>;
}

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, updates }: UpdateWorkflowParams) => {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', workflowId)
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: (data) => {
      // Update individual workflow cache
      queryClient.setQueryData<Workflow | null>(['workflow', data.id], (old) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      // Update workflows list cache
      queryClient.setQueryData<Workflow[]>(['workflows'], (old) => {
        if (!old) return old;
        return old.map((w) => (w.id === data.id ? { ...w, ...data } : w));
      });
    },
  });
};
