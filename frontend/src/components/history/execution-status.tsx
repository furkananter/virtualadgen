import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, PlayCircle, Clock } from 'lucide-react';

export const ExecutionStatus = ({ status }: { status: string }) => {
    switch (status) {
        case 'COMPLETED':
            return (
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1 font-bold text-[10px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </Badge>
            );
        case 'FAILED':
            return (
                <Badge variant="destructive" className="gap-1 bg-destructive/10 text-destructive border-destructive/20 font-bold text-[10px]">
                    <AlertCircle className="h-3.5 w-3.5" /> Failed
                </Badge>
            );
        case 'RUNNING':
            return (
                <Badge className="bg-primary/10 text-primary animate-pulse border-primary/20 gap-1 font-bold text-[10px]">
                    <PlayCircle className="h-3.5 w-3.5" /> Running
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="gap-1 opacity-50 font-bold text-[10px]">
                    <Clock className="h-3.5 w-3.5" /> {status}
                </Badge>
            );
    }
};
