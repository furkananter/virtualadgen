import { useParams, useNavigate } from 'react-router-dom';
import { useExecutionsQuery } from '@/lib/queries/use-executions-query';
import { useWorkflowQuery } from '@/lib/queries/use-workflow-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { ExecutionCard } from '@/components/history/execution-card';

export const WorkflowHistoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: workflow } = useWorkflowQuery(id);
    const { data: executions, isLoading } = useExecutionsQuery(id);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Premium Header */}
            <header className="border-b bg-card/10 backdrop-blur-2xl sticky top-0 z-50">
                <div className="w-full px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button
                            className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-90 border border-border/50"
                            onClick={() => navigate(`/workflows/${id}`)}
                        >
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                        </button>

                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold tracking-tight">
                                {workflow?.name || 'Workflow'} History
                            </h1>
                            <p className="text-xs text-muted-foreground font-medium">
                                View all past generation logs and results
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="px-4 py-2 bg-muted/30 rounded-xl border border-border/50 flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Total Runs</span>
                                <span className="text-sm font-black">{executions?.length || 0}</span>
                            </div>
                            <div className="w-px h-6 bg-border/40" />
                            <Sparkles className="h-4 w-4 text-primary/60" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full px-4 md:px-8 py-10 flex-1">
                {isLoading ? (
                    <div className="py-20">
                        <LoadingScreen message="Extracting generation history..." />
                    </div>
                ) : !executions || executions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-muted/30 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                            <Calendar className="h-10 w-10 opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight mb-2">No History Found</h2>
                        <p className="text-sm text-muted-foreground max-w-xs mb-8">
                            This workflow hasn't been executed yet. Start generating to see your history here.
                        </p>
                        <Button
                            onClick={() => navigate(`/workflows/${id}`)}
                            className="rounded-2xl px-8 font-bold h-12 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            Go to Editor & Run
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {executions.map((execution, index) => (
                            <div
                                key={execution.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <ExecutionCard execution={execution} />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
