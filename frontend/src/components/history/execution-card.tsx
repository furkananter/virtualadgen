import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ExecutionStatus } from './execution-status';
import { ExecutionGallery } from './execution-gallery';
import type { Execution, Generation } from '@/types/database';

interface ExecutionCardProps {
    execution: Execution & { generations?: Generation[] };
}

export const ExecutionCard = ({ execution }: ExecutionCardProps) => {
    const imageUrls = execution.generations?.flatMap((g) => g.image_urls) || [];

    return (
        <Card className="group overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 bg-card/30">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-muted-foreground opacity-60">
                            ID: {execution.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-bold">
                                {format(new Date(execution.started_at), 'MMM d, yyyy • HH:mm')}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border/40" />
                    <ExecutionStatus status={execution.status} />
                </div>

                <div className="flex items-center gap-3">
                    {typeof execution.total_cost === 'number' && execution.total_cost > 0 && (
                        <span className="text-xs font-mono text-primary font-bold bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                            ${execution.total_cost.toFixed(4)}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-4">
                <ExecutionGallery imageUrls={imageUrls} />
            </CardContent>
        </Card>
    );
};
