import { Button } from '@/components/ui/button';
import { Play, StepForward, Square, Save, Bug, Loader2 } from 'lucide-react';
import { useExecutionStore } from '@/stores/execution-store';
import { useCanvasStore } from '@/stores/canvas-store';
import { useWorkflowStore } from '@/stores/workflow-store';
import { useExecuteWorkflow } from '@/lib/mutations/use-execute-workflow';
import { useSaveWorkflow } from '@/lib/mutations/use-save-workflow';
import { useStepExecution } from '@/lib/mutations/use-step-execution';
import { useCancelExecution } from '@/lib/mutations/use-cancel-execution';
import { useDebugStore } from '@/stores/debug-store';
import { toast } from 'sonner';

export const CanvasToolbar = () => {
  const { currentWorkflow } = useWorkflowStore();
  const { nodes, edges } = useCanvasStore();
  const { isExecuting } = useExecutionStore();
  const { isPaused, clearNodeExecutions } = useDebugStore();

  const executeWorkflow = useExecuteWorkflow();
  const saveWorkflow = useSaveWorkflow();
  const stepExecution = useStepExecution();
  const cancelExecution = useCancelExecution();

  const handleRun = async () => {
    if (currentWorkflow) {
      clearNodeExecutions();

      // Auto-save before running
      try {
        await saveWorkflow.mutateAsync({
          workflowId: currentWorkflow.id,
          nodes,
          edges,
        });
      } catch {
        toast.error('Failed to save workflow before execution');
        return;
      }

      toast.promise(executeWorkflow.mutateAsync(currentWorkflow.id), {
        loading: 'Starting workflow execution...',
        success: 'Workflow started successfully!',
        error: 'Failed to start workflow execution'
      });
    }
  };

  const handleSave = () => {
    if (currentWorkflow) {
      toast.promise(saveWorkflow.mutateAsync({
        workflowId: currentWorkflow.id,
        nodes,
        edges,
      }), {
        loading: 'Saving workflow...',
        success: 'Workflow saved successfully!',
        error: 'Failed to save workflow'
      });
    }
  };

  const handleStep = () => {
    stepExecution.mutate();
  };

  const handleStop = () => {
    cancelExecution.mutate();
  };

  const hasNodes = nodes.length > 0;

  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur p-1 rounded-xl border shadow-xl">
      {!isPaused && !isExecuting && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-all font-bold"
          onClick={handleRun}
          disabled={isExecuting || !hasNodes || !currentWorkflow}
        >
          <Play className="h-4 w-4 fill-current" />
          Run
        </Button>
      )}

      {isPaused && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 font-bold text-amber-500 hover:text-amber-600 hover:bg-amber-50"
          onClick={handleStep}
          disabled={stepExecution.isPending}
        >
          {stepExecution.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StepForward className="h-4 w-4" />}
          Step
        </Button>
      )}

      {(isExecuting || isPaused) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-destructive font-bold hover:bg-destructive/10"
          onClick={handleStop}
          disabled={cancelExecution.isPending}
        >
          <Square className="h-4 w-4 fill-current" />
          Stop
        </Button>
      )}

      <div className="w-px h-4 bg-border mx-1" />

      <Button variant="ghost" size="sm" className="h-8 gap-2 font-bold opacity-60 hover:opacity-100 transition-opacity">
        <Bug className="h-4 w-4" />
        Debug
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-2 font-bold"
        onClick={handleSave}
        disabled={saveWorkflow.isPending || !currentWorkflow}
      >
        {saveWorkflow.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save
      </Button>

      {hasNodes && (
        <>
          <div className="w-px h-4 bg-border mx-1" />
          <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
            <span className="text-foreground">{nodes.length}</span> Nodes • <span className="text-foreground">{edges.length}</span> Edges
          </div>
        </>
      )}
    </div>
  );
};
