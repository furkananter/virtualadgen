import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { ContextMenuTrigger } from '@radix-ui/react-context-menu';
import { Trash2, Copy, Flag } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas-store';
import type { ReactNode } from 'react';

interface NodeContextMenuProps {
  nodeId: string;
  children: ReactNode;
}

export const NodeContextMenu = ({ nodeId, children }: NodeContextMenuProps) => {
  const { deleteNode, nodes, setNodes } = useCanvasStore();

  const handleDelete = () => {
    deleteNode(nodeId);
  };

  const handleDuplicate = () => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newNode = {
      ...node,
      id: crypto.randomUUID(),
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      selected: true,
    };

    setNodes([
      ...nodes.map((n) => ({ ...n, selected: false })),
      newNode,
    ]);
  };

  const handleToggleBreakpoint = () => {
    setNodes(
      nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, has_breakpoint: !n.data.has_breakpoint } }
          : n
      )
    );
  };

  const node = nodes.find((n) => n.id === nodeId);
  const hasBreakpoint = node?.data?.has_breakpoint;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleToggleBreakpoint}>
          <Flag className="h-4 w-4" />
          {hasBreakpoint ? 'Remove Breakpoint' : 'Add Breakpoint'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
