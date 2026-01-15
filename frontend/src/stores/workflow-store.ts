import { create } from 'zustand';
import type { Workflow } from '@/types/database';

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  clearCurrentWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  workflows: [],
  currentWorkflow: null,
  setWorkflows: (workflows) => set({ workflows }),
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  clearCurrentWorkflow: () => set({ currentWorkflow: null }),
}));
