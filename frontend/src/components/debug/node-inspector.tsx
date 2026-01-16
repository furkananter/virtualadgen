import { useDebugStore } from '@/stores/debug-store';
import { AlertCircle, CheckCircle2, Clock, PlayCircle, Copy, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NodeInspectorProps {
    nodeId: string;
}

interface DataSectionProps {
    title: string;
    data: unknown;
}

const DataSection = ({ title, data }: DataSectionProps) => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(data ?? {}, null, 2));
            setCopied(true);
            toast.success(`${title} copied to clipboard`);
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <div className="space-y-2 mb-6 group">
            <div className="flex items-center justify-between px-0.5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{title}</h4>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                        copied ? "text-green-500" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
                    )}
                    onClick={handleCopy}
                >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
            </div>
            <div className="bg-muted/10 dark:bg-white/5 rounded-[20px] p-4 border border-border/80 dark:border-white/10 overflow-hidden relative transition-colors group-hover:border-primary/20">
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto no-scrollbar scroll-smooth">
                    {JSON.stringify(data ?? {}, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export const NodeInspector = ({ nodeId }: NodeInspectorProps) => {
    const { nodeExecutions } = useDebugStore();
    const execution = nodeExecutions.get(nodeId);

    if (!execution) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50 space-y-2">
                <Clock className="h-8 w-8" />
                <p className="text-xs font-medium">No execution data yet</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'FAILED': return <AlertCircle className="h-4 w-4 text-destructive" />;
            case 'RUNNING': return <PlayCircle className="h-4 w-4 text-primary animate-pulse" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center justify-between mb-6 p-3 bg-muted/20 rounded-[20px] border border-border/10">
                <div className="flex items-center gap-2">
                    {getStatusIcon(execution.status)}
                    <span className="text-xs font-bold uppercase tracking-tight">{execution.status}</span>
                </div>
                {execution.finished_at && (
                    <span className="text-[9px] text-muted-foreground font-medium">
                        {new Date(execution.finished_at).toLocaleTimeString()}
                    </span>
                )}
            </div>

            {execution.error_message && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-[20px]">
                    <p className="text-[10px] font-bold text-destructive leading-normal">
                        Error: {execution.error_message}
                    </p>
                </div>
            )}

            <DataSection title="Input Data" data={execution.input_data} />
            <DataSection title="Output Data" data={execution.output_data} />
        </div>
    );
};
