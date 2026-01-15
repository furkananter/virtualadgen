import { useParams, useNavigate } from 'react-router-dom';
import { useExecutionsQuery } from '@/lib/queries/use-executions-query';
import { useWorkflowQuery } from '@/lib/queries/use-workflow-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ExecutionCard } from '@/components/history/execution-card';

export const WorkflowHistoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: workflow } = useWorkflowQuery(id);
    const { data: executions, isLoading } = useExecutionsQuery(id);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-muted"
                            onClick={() => navigate(`/workflows/${id}`)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-sm font-bold truncate max-w-[300px]">
                                {workflow?.name || 'Workflow'} History
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                Generation Archives
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 flex-1">
                {isLoading ? (
                    <div className="py-20">
                        <LoadingScreen message="Extracting generation history..." />
                    </div>
                ) : !executions || executions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Calendar className="h-12 w-12 opacity-20 mb-4" />
                        <p className="text-sm font-medium">No execution history found for this workflow.</p>
                        <Button variant="link" onClick={() => navigate(`/workflows/${id}`)}>Go to Editor & Run</Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {executions.map((execution) => (
                            <ExecutionCard key={execution.id} execution={execution} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
