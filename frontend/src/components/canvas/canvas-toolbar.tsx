import * as React from 'react';
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
import { cn } from '@/lib/utils';

import { useIsMutating } from '@tanstack/react-query';

export const CanvasToolbar = () => {
  const isSavingGlobal = useIsMutating({ mutationKey: ['save-workflow'] }) > 0;
  const [showSavedStatus, setShowSavedStatus] = React.useState(false);
  const prevIsSaving = React.useRef(isSavingGlobal);

  React.useEffect(() => {
    if (prevIsSaving.current && !isSavingGlobal) {
      setShowSavedStatus(true);
      const timer = setTimeout(() => setShowSavedStatus(false), 3000);
      return () => clearTimeout(timer);
    }
    prevIsSaving.current = isSavingGlobal;
  }, [isSavingGlobal]);
  const { currentWorkflow } = useWorkflowStore();
  const { nodes, edges } = useCanvasStore();

  // Subscribe to actual state values for proper reactivity
  const currentExecution = useExecutionStore((state) => state.currentExecution);
  const executionStatus = currentExecution?.status;
  // Execution is active if pending, running, or paused
  const isExecuting = executionStatus === 'PENDING' || executionStatus === 'RUNNING' || executionStatus === 'PAUSED';
  const canStop = executionStatus === 'PENDING' || executionStatus === 'RUNNING' || executionStatus === 'PAUSED';

  const { isPaused, clearNodeExecutions, debugMode, toggleDebugMode } = useDebugStore();

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
  const handleToggleDebug = () => {
    toggleDebugMode();
    toast.info(debugMode ? 'Debug mode deactivated' : 'Debug mode activated');
  };

  return (
    <div className="flex items-center gap-2 bg-card/80 backdrop-blur-3xl p-1.5 rounded-[20px] border border-border/40 pointer-events-auto">
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

      {canStop && (
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

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 font-bold transition-all",
          debugMode ? "text-primary bg-primary/10 opacity-100 shadow-sm" : "opacity-60 hover:opacity-100"
        )}
        onClick={handleToggleDebug}
      >
        <Bug className={cn("h-4 w-4", debugMode && "animate-pulse")} />
        Debug
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 font-bold transition-all min-w-[90px]",
          isSavingGlobal ? "text-primary opacity-100" : showSavedStatus ? "text-emerald-500 opacity-100" : "opacity-60 hover:opacity-100"
        )}
        onClick={handleSave}
        disabled={isSavingGlobal || !currentWorkflow}
      >
        {isSavingGlobal ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : showSavedStatus ? (
          <Save className="h-4 w-4 fill-emerald-500/20" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSavingGlobal ? 'Saving...' : showSavedStatus ? 'Saved' : 'Save'}
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
