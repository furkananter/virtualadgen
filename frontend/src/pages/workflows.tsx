import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Plus, Workflow as WorkflowIcon } from 'lucide-react';
import { useWorkflowsQuery } from '@/lib/queries/use-workflows-query';
import { useCreateWorkflow } from '@/lib/mutations/use-create-workflow';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const WorkflowsPage = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflowsQuery();
  const createWorkflow = useCreateWorkflow();

  const handleCreate = async () => {
    try {
      const workflow = await createWorkflow.mutateAsync({
        name: 'New Workflow',
        description: 'New workflow description',
        is_active: true,
      });
      navigate(`/workflows/${workflow.id}`);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <PageContainer>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
              <p className="text-muted-foreground">Manage and run your ad generation workflows.</p>
            </div>
            <Button className="gap-2" onClick={handleCreate} disabled={createWorkflow.isPending}>
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : workflows && workflows.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workflows.map((workflow) => (
                <Link key={workflow.id} to={`/workflows/${workflow.id}`}>
                  <Card className="hover:border-primary transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <WorkflowIcon className="h-4 w-4" />
                        </div>
                        <Badge variant={workflow.is_active ? "default" : "secondary"} className="ml-auto">
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardTitle>{workflow.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {workflow.description || 'No description provided.'}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="text-xs text-muted-foreground pt-0">
                      Created {new Date(workflow.created_at).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-24 flex flex-col items-center justify-center text-center text-muted-foreground">
              <p className="mb-4">No workflows found. Create your first one to get started!</p>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCreate} disabled={createWorkflow.isPending}>
                <Plus className="h-4 w-4" /> Create First Workflow
              </Button>
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  );
};
