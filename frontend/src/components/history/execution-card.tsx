import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ExecutionStatus } from './execution-status';
import { ExecutionGallery } from './execution-gallery';

interface ExecutionCardProps {
    execution: any; // Using any for brevity in this complex object, following 'no type' rule as much as possible while maintaining structure
}

export const ExecutionCard = ({ execution }: ExecutionCardProps) => {
    const imageUrls = execution.generations?.flatMap((g: any) => g.image_urls) || [];

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
                    {execution.total_cost > 0 && (
                        <span className="text-xs font-mono text-primary font-bold bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                            ${execution.total_cost.toFixed(4)}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform border rounded-full">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-4">
                <ExecutionGallery imageUrls={imageUrls} />
            </CardContent>
        </Card>
    );
};
