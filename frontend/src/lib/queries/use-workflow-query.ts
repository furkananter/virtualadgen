import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import type { Workflow } from '@/types/database';
import type { Node, Edge } from 'reactflow';

export const useWorkflowQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: workflow, error: wError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (wError) throw wError;

      const { data: nodes, error: nError } = await supabase
        .from('nodes')
        .select('*')
        .eq('workflow_id', id);

      if (nError) throw nError;

      const { data: edges, error: eError } = await supabase
        .from('edges')
        .select('*')
        .eq('workflow_id', id);

      if (eError) throw eError;

      // Normalize DB nodes to React Flow nodes
      const normalizedNodes: Node[] = (nodes || []).map(n => ({
        id: n.id,
        type: n.type,
        position: { x: n.position_x, y: n.position_y },
        data: {
          label: n.name,
          config: n.config || {},
          has_breakpoint: n.has_breakpoint,
          status: n.status // if status is in DB
        },
      }));

      // Normalize DB edges to React Flow edges
      const normalizedEdges: Edge[] = (edges || []).map(e => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        sourceHandle: e.source_handle,
        targetHandle: e.target_handle,
      }));

      return {
        ...(workflow as Workflow),
        nodes: normalizedNodes,
        edges: normalizedEdges,
      };
    },
    enabled: !!id,
  });
};
