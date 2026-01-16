import { useDebugStore } from '@/stores/debug-store';
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface NodeInspectorProps {
    nodeId: string;
}

interface DataSectionProps {
    title: string;
    data: unknown;
}

const DataSection = ({ title, data }: DataSectionProps) => (
    <div className="space-y-2 mb-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">{title}</h4>
        <div className="bg-muted/30 rounded-xl p-3 border border-border/20 overflow-hidden">
            <pre className="text-[10px] font-mono whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto no-scrollbar">
                {JSON.stringify(data || {}, null, 2)}
            </pre>
        </div>
    </div>
);

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
            <div className="flex items-center justify-between mb-6 p-3 bg-muted/20 rounded-xl border border-border/10">
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
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
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
