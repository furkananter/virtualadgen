import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWorkflow } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      await deleteWorkflow(workflowId);
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
