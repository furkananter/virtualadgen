import type { ReactNode } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useNodeId, useEdges } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { NodeExecutionStatus } from '@/types/database';
import type { NodeData } from '@/types/nodes';
import { cn } from '@/lib/utils';
import { useDebugStore } from '@/stores/debug-store';
import { NodeContextMenu } from '@/components/canvas/node-context-menu';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Terminal, Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';

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
        "w-6 h-6 transition-all duration-300 border-[3px]! rounded-full! z-50",
        "hover:scale-125 cursor-crosshair border-white!", // Forced white border to pop
        type === 'target' ? "-left-[12px]" : "-right-[12px]",
        isConnected
          ? "bg-black! opacity-100"
          : "bg-[#333333]! opacity-100"
      )}
      style={{
        boxShadow: isConnected ? `0 0 15px ${color}80` : 'none',
        transform: isConnected ? (type === 'target' ? 'translateX(-3px)' : 'translateX(3px)') : undefined
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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
          "min-w-[240px] max-w-[300px] relative transition-all duration-500 bg-background",
          "rounded-[32px] border-4 outline-none! ring-0!",
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
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-8 w-8 rounded-[12px] flex items-center justify-center transition-all active:scale-90 hover:brightness-110"
                    style={{
                      backgroundColor: `${nodeColor}10`,
                      color: nodeColor
                    }}
                  >
                    <Terminal className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-[320px] p-0 bg-background/95 backdrop-blur-3xl border border-border/50 shadow-2xl rounded-[20px] overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-5 py-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <Hash className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-[0.15em]">Node Inspector</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(id, 'Node ID')}
                      className="p-2 hover:bg-muted rounded-xl transition-all active:scale-95 text-muted-foreground hover:text-foreground"
                      title="Copy System ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[10px] uppercase font-black text-muted-foreground/50 tracking-widest pl-0.5">System ID</label>
                      <div className="p-3 bg-muted/30 rounded-2xl font-mono text-[11px] break-all border border-border/50 text-foreground/80 leading-relaxed">
                        {id}
                      </div>
                    </div>

                    {data.execution_data ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pl-0.5">
                          <label className="text-[10px] uppercase font-black text-primary tracking-widest">Raw Output</label>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(data.execution_data, null, 2), 'Output Data')}
                            className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors"
                          >
                            Copy JSON
                          </button>
                        </div>
                        <div className="p-4 bg-[#1E1E2E] dark:bg-black/60 rounded-2xl border border-white/5 shadow-inner">
                          <pre className="font-mono text-[11px] text-blue-300 dark:text-blue-400 max-h-60 overflow-y-auto no-scrollbar leading-relaxed scroll-smooth">
                            {JSON.stringify(data.execution_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                        <Terminal className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[10px] font-medium text-muted-foreground/60">No execution data available</p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
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
