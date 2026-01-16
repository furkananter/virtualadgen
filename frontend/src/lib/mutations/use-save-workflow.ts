import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    deleteEdgesByWorkflowId,
    deleteNodesByWorkflowId,
    insertNodes,
    insertEdges,
    touchWorkflow,
    type DbNode,
    type DbEdge,
} from '@/lib/supabase';
import type { Node, Edge } from 'reactflow';
import { toast } from 'sonner';
import type { Workflow } from '@/types/database';

interface SaveWorkflowParams {
    workflowId: string;
    nodes: Node[];
    edges: Edge[];
}

interface WorkflowWithNodesEdges extends Workflow {
    nodes: Node[];
    edges: Edge[];
}

const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

export const useSaveWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ workflowId, nodes, edges }: SaveWorkflowParams) => {
            const idMap: Record<string, string> = {};

            const sanitizedNodes: DbNode[] = nodes.map(node => {
                let id = node.id;
                if (!isUUID(id)) {
                    const newId = crypto.randomUUID();
                    idMap[id] = newId;
                    id = newId;
                }
                return {
                    id,
                    workflow_id: workflowId,
                    type: node.type || 'unknown',
                    name: node.data.label || 'Untitled Node',
                    config: node.data.config || {},
                    position_x: Math.round(node.position.x),
                    position_y: Math.round(node.position.y),
                    has_breakpoint: !!node.data.has_breakpoint,
                };
            });

            const sanitizedEdges: DbEdge[] = edges.map(edge => {
                let id = edge.id;
                if (!isUUID(id)) {
                    id = crypto.randomUUID();
                }
                return {
                    id,
                    workflow_id: workflowId,
                    source_node_id: idMap[edge.source] || edge.source,
                    target_node_id: idMap[edge.target] || edge.target,
                    source_handle: edge.sourceHandle,
                    target_handle: edge.targetHandle,
                };
            });

            // Delete existing edges then nodes (order matters for FK constraints)
            await deleteEdgesByWorkflowId(workflowId);
            await deleteNodesByWorkflowId(workflowId);

            // Insert new nodes then edges
            await insertNodes(sanitizedNodes);
            await insertEdges(sanitizedEdges);

            // Update workflow timestamp
            await touchWorkflow(workflowId);

            // Map back to React Flow format
            const finalNodes: Node[] = sanitizedNodes.map(sn => ({
                id: sn.id,
                type: sn.type,
                position: { x: sn.position_x, y: sn.position_y },
                data: { label: sn.name, config: sn.config, has_breakpoint: sn.has_breakpoint }
            }));

            const finalEdges: Edge[] = sanitizedEdges.map(se => ({
                id: se.id,
                source: se.source_node_id,
                target: se.target_node_id,
                sourceHandle: se.source_handle,
                targetHandle: se.target_handle
            }));

            return { nodes: finalNodes, edges: finalEdges };
        },
        onSuccess: (data, { workflowId }) => {
            queryClient.setQueryData<WorkflowWithNodesEdges>(['workflow', workflowId], (old) => {
                if (!old) return undefined;
                return {
                    ...old,
                    nodes: data.nodes,
                    edges: data.edges,
                };
            });
        },
        onError: (error: Error) => {
            console.error('Save error:', error);
            toast.error(`Save failed: ${error.message}`);
        }
    });
};
