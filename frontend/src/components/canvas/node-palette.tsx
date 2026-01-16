import type { DragEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { NodeType } from '@/types/database';
import { useAuthStore } from '@/stores/auth-store';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import { useReactFlow } from 'reactflow';
import { useCanvasStore } from '@/stores/canvas-store';
import { toast } from 'sonner';
import { generateAIWorkflow } from '@/lib/templates';
import { cn } from '@/lib/utils';

import { LogoSection } from './node-palette/logo-section';
import { NavigationLinks } from './node-palette/navigation-links';
import { NodeLibrary } from './node-palette/node-library';
import { UserSection } from './node-palette/user-section';

export const NodePalette = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    setNodes,
    setEdges,
    setSelectedNodeId,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useCanvasStore();
  const { fitView } = useReactFlow();

  const handleCreateExample = () => {
    const { nodes, edges } = generateAIWorkflow();
    setNodes(nodes);
    setEdges(edges);
    setSelectedNodeId(null);
    toast.success('AI Workflow generated!');

    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "h-full border-r bg-card/10 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out select-none relative",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-12 w-6 h-6 bg-card border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm z-50 group"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        )}
      </button>

      <LogoSection sidebarCollapsed={sidebarCollapsed} />

      <div className="px-3 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1">
        <NavigationLinks
          id={id}
          sidebarCollapsed={sidebarCollapsed}
          handleCreateExample={handleCreateExample}
        />

        <NodeLibrary
          sidebarCollapsed={sidebarCollapsed}
          onDragStart={onDragStart}
        />
      </div>

      <UserSection
        user={user}
        sidebarCollapsed={sidebarCollapsed}
        handleLogout={handleLogout}
      />
    </aside>
  );
};
