import type { ReactNode } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useNodeId, useEdges } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { NodeExecutionStatus } from '@/types/database';
import type { NodeData } from '@/types/nodes';
import { cn } from '@/lib/utils';
import { useDebugStore } from '@/stores/debug-store';
import { NodeContextMenu } from '@/components/canvas/node-context-menu';

import { Terminal } from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas-store';

import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import type { NodeType } from '@/types/database';

interface BaseNodeProps extends NodeProps<NodeData> {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const ConnectionHandle = ({ type, position, id, color }: { type: 'target' | 'source', position: Position, id?: string, color?: string }) => {
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
        "w-6 h-6 transition-all duration-300 rounded-full! z-50 border-[3px]! border-foreground! bg-background!",
        "hover:scale-110 cursor-crosshair shadow-xl",
        type === 'target' ? "-left-[13px]" : "-right-[13px]",
        isConnected ? "opacity-100 scale-105" : "opacity-60 hover:opacity-100"
      )}
      style={{
        boxShadow: isConnected ? `0 0 20px ${color}` : 'none',
      }}
    />
  );
};

export const BaseNode = ({
  id,
  type,
  title,
  icon,
  children,
  selected,
  data,
  className
}: BaseNodeProps) => {
  const { setSelectedNodeId, setConfigPanelTab } = useCanvasStore();
  const { debugMode } = useDebugStore();
  const config = NODE_CONFIGS[type as NodeType];
  const nodeColor = config?.color || '#3b82f6';
  const status = data.status as NodeExecutionStatus | undefined;

  const getBorderColor = () => {
    if (selected) return 'hsl(var(--foreground))';
    if (status === 'PAUSED') return '#f59e0b'; // Amber pulse for breakpoint
    if (status === 'FAILED') return '#ef4444';
    if (status === 'COMPLETED') return '#10b981';
    return nodeColor;
  };


  const getStatusIndicator = (s?: NodeExecutionStatus) => {
    switch (s) {
      case 'RUNNING': return 'bg-primary animate-pulse';
      case 'COMPLETED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      case 'PAUSED': return 'bg-amber-500 animate-pulse';
      default: return 'bg-muted-foreground/30';
    }
  };

  return (
    <NodeContextMenu nodeId={id}>
      <Card
        className={cn(
          "w-[280px] relative transition-all duration-500 bg-background",
          "rounded-[32px] border-2 outline-none! ring-0!",
          status === 'PAUSED' && "shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] animate-pulse border-amber-500",
          className
        )}
        style={{
          borderColor: getBorderColor(),
        }}
        data-selected={selected}
        data-status={status}
      >
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {icon && (
              <div
                className="shrink-0 transition-transform group-hover:scale-105"
                style={{ color: nodeColor }}
              >
                {icon}
              </div>
            ) || <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: nodeColor }} />}
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-sm font-bold truncate tracking-tight">{title}</CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {debugMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(id);
                  setConfigPanelTab('inspector');
                }}
                className="h-8 w-8 rounded-[12px] flex items-center justify-center transition-all active:scale-90 hover:brightness-110 shrink-0"
                style={{
                  backgroundColor: `${nodeColor}10`,
                  color: nodeColor
                }}
              >
                <Terminal className="h-4 w-4" />
              </button>
            )}

            {data.has_breakpoint && (
              <div className="h-4 w-4 bg-destructive text-white rounded-lg flex items-center justify-center text-[10px] font-black border-2 border-background">
                !
              </div>
            )}

            {status === 'RUNNING' ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-lg animate-spin" />
            ) : (
              <div className={cn("h-3 w-3 rounded-lg ring-2 ring-background transition-colors duration-500", getStatusIndicator(status))} />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-[12px] font-medium opacity-70 overflow-hidden leading-relaxed">
          {children}
        </CardContent>

        <ConnectionHandle type="target" position={Position.Left} color={nodeColor} />
        <ConnectionHandle type="source" position={Position.Right} color={nodeColor} />
      </Card>
    </NodeContextMenu>
  );
};
