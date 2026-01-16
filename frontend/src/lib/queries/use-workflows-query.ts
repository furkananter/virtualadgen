import { useQuery } from '@tanstack/react-query';
import { getAllWorkflows } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

export const useWorkflowsQuery = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async (): Promise<Workflow[]> => {
      return await getAllWorkflows();
    },
  });
};
