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
  const { setNodes, setEdges, selectedNodeId, sidebarCollapsed, setSidebarCollapsed } = useCanvasStore();

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      setNodes((workflow.nodes || []) as unknown as Node<NodeData>[]);
      setEdges((workflow.edges || []) as unknown as Edge[]);
    }
  }, [workflow, setCurrentWorkflow, setNodes, setEdges]);

  // Auto-collapse sidebar on mobile (mount only)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

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
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar menu"
            aria-expanded={!sidebarCollapsed}
            className={cn(
              "fixed left-4 top-4 z-50 p-2 bg-card border rounded-[12px] md:hidden transition-opacity duration-300",
              !sidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className="w-full h-0.5 bg-foreground rounded-full" />
              <span className="w-full h-0.5 bg-foreground rounded-full" />
              <span className="w-3/4 h-0.5 bg-foreground rounded-full" />
            </div>
          </button>

          {/* Left Sidebar */}
          <div className={cn(
            "fixed inset-y-0 left-0 z-50 md:relative md:z-40 h-full transition-all duration-300 ease-in-out border-r border-border/40",
            sidebarCollapsed
              ? "-translate-x-full md:translate-x-0 w-64 md:w-20"
              : "translate-x-0 w-64 md:w-64"
          )}>
            <NodePalette />
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 relative min-w-0">
            <WorkflowCanvas />
          </div>

          {/* Right Config Sidebar - Contextual */}
          <div
            className={cn(
              "fixed inset-y-0 right-0 z-50 md:relative transition-all duration-300 ease-in-out overflow-hidden shrink-0",
              selectedNodeId
                ? "w-full md:w-80 border-l border-border/40"
                : "w-0 border-l-0 translate-x-full md:translate-x-0"
            )}
          >
            <div className="w-full md:w-80 h-full overflow-y-auto no-scrollbar">
              <ConfigPanel />
            </div>
          </div>

          {/* Mobile Overlay Backdrop */}
          {!sidebarCollapsed && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}
        </ReactFlowProvider>
      </main>
    </div>
  );
};
