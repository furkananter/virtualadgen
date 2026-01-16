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
  isExecuting: () => get().currentExecution?.status === 'RUNNING',
  isTerminal: () => {
    const status = get().currentExecution?.status;
    return status ? TERMINAL_STATUSES.includes(status) : false;
  },
  canStop: () => {
    const state = get();
    return state.isExecuting() && !state.isTerminal();
  },

  // Actions
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  clearExecution: () => set({ currentExecution: null }),
}));
