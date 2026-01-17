import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Plus, Workflow as WorkflowIcon, Pencil, Trash2 } from 'lucide-react';
import { useWorkflowsQuery } from '@/lib/queries/use-workflows-query';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { useCreateWorkflow } from '@/lib/mutations/use-create-workflow';
import { useUpdateWorkflow } from '@/lib/mutations/use-update-workflow';
import { useDeleteWorkflow } from '@/lib/mutations/use-delete-workflow';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const WorkflowsPage = () => {
  const navigate = useNavigate();
  const { data: workflows, isLoading } = useWorkflowsQuery();
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const handleCreate = async () => {
    try {
      const workflow = await createWorkflow.mutateAsync({
        name: 'New Workflow',
        description: 'New workflow description',
        is_active: true,
      });
      navigate(`/workflows/${workflow.id}`);
    } catch (error) {
      toast.error(`Failed to create workflow: ${(error as Error).message}`);
    }
  };

  const handleRename = async (workflow: { id: string; name: string; description: string | null }) => {
    const name = window.prompt('Workflow name', workflow.name);
    if (!name || name.trim().length === 0) return;

    const descriptionInput = window.prompt('Workflow description', workflow.description || '');
    const description = descriptionInput === null ? workflow.description : descriptionInput;

    try {
      await updateWorkflow.mutateAsync({
        workflowId: workflow.id,
        updates: { name: name.trim(), description },
      });
      toast.success('Workflow updated');
    } catch (error) {
      toast.error(`Update failed: ${(error as Error).message}`);
    }
  };

  const handleDelete = async (workflowId: string) => {
    const confirmed = window.confirm('Delete this workflow? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteWorkflow.mutateAsync(workflowId);
      toast.success('Workflow deleted');
    } catch (error) {
      toast.error(`Delete failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <PageContainer>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-1">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workflows</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage and run your ad generation workflows.</p>
            </div>
            <Button className="gap-2 w-full sm:w-auto h-11 sm:h-10 rounded-xl sm:rounded-lg font-bold" onClick={handleCreate} disabled={createWorkflow.isPending}>
              <Plus className="h-4 w-4" /> New Workflow
            </Button>
          </div>

          {isLoading ? (
            <div className="py-20">
              <LoadingScreen message="Fetching your workflows..." />
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
                    <CardFooter className="text-xs text-muted-foreground pt-0 flex items-center justify-between">
                      <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleRename({
                              id: workflow.id,
                              name: workflow.name,
                              description: workflow.description,
                            });
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleDelete(workflow.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
