import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflows')
        .insert({ ...workflow, user_id: session.user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: (newWorkflow) => {
      queryClient.setQueryData<Workflow[]>(['workflows'], (old) => {
        return old ? [newWorkflow, ...old] : [newWorkflow];
      });
    },
  });
};
