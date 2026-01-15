import type { ReactNode } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useNodeId, useEdges } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NodeExecutionStatus } from '@/types/database';
import type { NodeData } from '@/types/nodes';
import { cn } from '@/lib/utils';

interface BaseNodeProps extends NodeProps<NodeData> {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  status?: NodeExecutionStatus;
}

const ConnectionHandle = ({ type, position, id }: { type: 'target' | 'source', position: Position, id?: string }) => {
  const nodeId = useNodeId();
  const edges = useEdges();

  const isConnected = edges.some(edge =>
    (type === 'target' && edge.target === nodeId && (id ? edge.targetHandle === id : true)) ||
    (type === 'source' && edge.source === nodeId && (id ? edge.sourceHandle === id : true))
  );

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={cn(
        "w-1.5 h-6 transition-all duration-300 border-none! rounded-full! z-50",
        type === 'target' ? "-left-1" : "-right-1",
        isConnected
          ? "bg-primary! h-7 w-2 shadow-sm"
          : "bg-muted-foreground/30! hover:bg-muted-foreground/60!"
      )}
    />
  );
};

export const BaseNode = ({
  title,
  icon,
  children,
  status,
  selected,
  data
}: BaseNodeProps) => {
  const getStatusColor = (s?: NodeExecutionStatus) => {
    switch (s) {
      case 'RUNNING': return 'bg-primary animate-pulse';
      case 'COMPLETED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      case 'PAUSED': return 'bg-yellow-500';
      default: return 'bg-muted-foreground/30';
    }
  };

  return (
    <Card
      className="min-w-[200px] max-w-[320px] relative overflow-visible!"
      data-selected={selected}
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-sm font-bold">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          {data.has_breakpoint && (
            <Badge variant="destructive" className="h-4 w-4 p-0 rounded-full flex items-center justify-center text-[10px]">
              B
            </Badge>
          )}
          <div className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-[11px] font-medium opacity-80 overflow-hidden">
        {children}
      </CardContent>

      <ConnectionHandle type="target" position={Position.Left} />
      <ConnectionHandle type="source" position={Position.Right} />
    </Card>
  );
};
