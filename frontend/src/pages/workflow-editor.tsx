import { WorkflowCanvas } from '@/components/canvas/workflow-canvas';
import { NodePalette } from '@/components/canvas/node-palette';
import { ConfigPanel } from '@/components/config-panels';
import { ReactFlowProvider } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useWorkflowQuery } from '@/lib/queries/use-workflow-query';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { Loader2 } from 'lucide-react';

export const WorkflowEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: workflow, isLoading, error } = useWorkflowQuery(id);
  const { setCurrentWorkflow } = useWorkflowStore();
  const { setNodes, setEdges } = useCanvasStore();

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      setNodes((workflow.nodes || []) as unknown as Node[]);
      setEdges((workflow.edges || []) as unknown as Edge[]);
    }
  }, [workflow, setCurrentWorkflow, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center text-destructive font-medium p-10 text-center">
          <div className="flex flex-col gap-4 items-center">
            <span className="text-4xl">😅</span>
            <p>Error loading workflow: {(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <main className="flex-1 relative flex overflow-hidden">
        <ReactFlowProvider>
          <div className="w-64 shrink-0 h-full">
            <NodePalette />
          </div>
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>
          <div className="w-80 shrink-0 border-l bg-card overflow-y-auto no-scrollbar">
            <ConfigPanel />
          </div>
        </ReactFlowProvider>
      </main>
    </div>
  );
};
