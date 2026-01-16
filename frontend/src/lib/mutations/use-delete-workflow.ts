import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;
      return workflowId;
    },
    onSuccess: (workflowId) => {
      queryClient.setQueryData<Workflow[]>(['workflows'], (old) => {
        return old ? old.filter((w) => w.id !== workflowId) : [];
      });
      queryClient.removeQueries({ queryKey: ['workflow', workflowId] });
    },
  });
};
