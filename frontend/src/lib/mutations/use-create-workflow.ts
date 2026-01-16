import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkflow } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      return await createWorkflow(workflow);
    },
    onSuccess: (newWorkflow) => {
      queryClient.setQueryData<Workflow[]>(['workflows'], (old) => {
        return old ? [newWorkflow, ...old] : [newWorkflow];
      });
    },
  });
};
