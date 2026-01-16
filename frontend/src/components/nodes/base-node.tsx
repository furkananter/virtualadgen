import type { ReactNode } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useNodeId, useEdges } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { NodeExecutionStatus } from '@/types/database';
import type { NodeData } from '@/types/nodes';
import { cn } from '@/lib/utils';
import { useDebugStore } from '@/stores/debug-store';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Terminal, Hash, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BaseNodeProps extends NodeProps<NodeData> {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
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
  id,
  title,
  icon,
  children,
  selected,
  data
}: BaseNodeProps) => {
  const { debugMode } = useDebugStore();
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  const status = data.status as NodeExecutionStatus | undefined;
  const getStatusIndicator = (s?: NodeExecutionStatus) => {
    switch (s) {
      case 'RUNNING': return 'bg-primary animate-pulse';
      case 'COMPLETED': return 'bg-emerald-500';
      case 'FAILED': return 'bg-red-500';
      case 'PAUSED': return 'bg-amber-500 animate-pulse';
      default: return 'bg-muted-foreground/30';
    }
  };

  const getCardStyles = (s?: NodeExecutionStatus) => {
    switch (s) {
      case 'RUNNING':
        return '';
      case 'COMPLETED':
        return '';
      case 'FAILED':
        return '';
      case 'PAUSED':
        return '';
      default:
        return '';
    }
  };

  return (
    <Card
      className={cn(
        "min-w-[200px] max-w-[320px] relative overflow-visible! transition-all duration-300",
        getCardStyles(status)
      )}
      data-selected={selected}
      data-status={status}
    >
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <div className="text-primary shrink-0 transition-transform group-hover:scale-110">{icon}</div>}
          <div className="flex flex-col min-w-0">
            <CardTitle className="text-sm font-bold truncate">{title}</CardTitle>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          {debugMode && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90">
                  <Terminal className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80 p-0 bg-popover/90 backdrop-blur-2xl border-primary/20 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-3 border-b border-border/10 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">Node Inspector</span>
                  </div>
                  <button onClick={() => copyToClipboard(id, 'Node ID')} className="p-1 hover:bg-primary/10 rounded-md transition-colors">
                    <Copy className="h-2.5 w-2.5 text-primary" />
                  </button>
                </div>
                <div className="p-3 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-widest">System ID</label>
                    <div className="p-2 bg-muted/40 rounded-lg font-mono text-[10px] break-all border border-border/10">
                      {id}
                    </div>
                  </div>

                  {data.execution_data && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] uppercase font-bold text-primary/60 tracking-widest">Raw Output</label>
                        <button onClick={() => copyToClipboard(JSON.stringify(data.execution_data, null, 2), 'Output Data')} className="text-[9px] text-primary hover:underline">Copy JSON</button>
                      </div>
                      <div className="p-2 bg-black/40 rounded-lg">
                        <pre className="font-mono text-[10px] text-primary/80 max-h-48 overflow-y-auto no-scrollbar leading-tight italic">
                          {JSON.stringify(data.execution_data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {data.has_breakpoint && (
            <div className="h-4 w-4 bg-destructive text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-background shadow-lg shadow-destructive/20">
              !
            </div>
          )}
          {status === 'RUNNING' ? (
            <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-background shadow-sm", getStatusIndicator(status))} />
          )}
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
