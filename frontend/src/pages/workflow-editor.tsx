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
import { LoadingScreen } from '@/components/shared/loading-screen';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/nodes';

export const WorkflowEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: workflow, isLoading, error } = useWorkflowQuery(id);
  const { setCurrentWorkflow } = useWorkflowStore();
  const { setNodes, setEdges, selectedNodeId } = useCanvasStore();

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      setNodes((workflow.nodes || []) as unknown as Node<NodeData>[]);
      setEdges((workflow.edges || []) as unknown as Edge[]);
    }
  }, [workflow, setCurrentWorkflow, setNodes, setEdges]);

  if (isLoading) {
    return <LoadingScreen message="Initializing Canvas..." />;
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
          {/* Left Sidebar */}
          <div className="w-64 shrink-0 h-full">
            <NodePalette />
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            <WorkflowCanvas />
          </div>

          {/* Right Config Sidebar - Contextual */}
          <div
            className={cn(
              "h-full border-l transition-all duration-500 ease-in-out overflow-hidden shrink-0",
              selectedNodeId ? "w-80 opacity-100" : "w-0 opacity-0 border-l-0"
            )}
          >
            <div className="w-80 h-full overflow-y-auto no-scrollbar">
              <ConfigPanel />
            </div>
          </div>
        </ReactFlowProvider>
      </main>
    </div>
  );
};
