import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

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
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.removeQueries({ queryKey: ['workflow', workflowId] });
    },
  });
};
