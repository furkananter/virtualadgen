import { create } from 'zustand';
import type { Execution, ExecutionStatus } from '@/types/database';

const TERMINAL_STATUSES: ExecutionStatus[] = ['COMPLETED', 'FAILED', 'CANCELLED'];

interface ExecutionState {
  currentExecution: Execution | null;

  // Derived selectors
  isExecuting: () => boolean;
  isTerminal: () => boolean;
  canStop: () => boolean;

  // Actions
  setCurrentExecution: (execution: Execution | null) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  currentExecution: null,

  // Derived selectors - compute from currentExecution.status
  isExecuting: () => {
    const status = get().currentExecution?.status;
    return status === 'PENDING' || status === 'RUNNING' || status === 'PAUSED';
  },
  isTerminal: () => {
    const status = get().currentExecution?.status;
    return status ? TERMINAL_STATUSES.includes(status) : false;
  },
  canStop: () => {
    const status = get().currentExecution?.status;
    // Can stop if running or paused (not terminal, not null)
    return status === 'RUNNING' || status === 'PAUSED';
  },

  // Actions
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  clearExecution: () => set({ currentExecution: null }),
}));
