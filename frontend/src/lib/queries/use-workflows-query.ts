import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';

export const useWorkflowsQuery = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Workflow[];
    },
  });
};
