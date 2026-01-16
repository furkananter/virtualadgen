import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkflow } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

interface UpdateWorkflowParams {
  workflowId: string;
  updates: Partial<Workflow>;
}

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, updates }: UpdateWorkflowParams) => {
      return await updateWorkflow(workflowId, updates);
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
