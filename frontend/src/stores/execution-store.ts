import { create } from 'zustand';
import type { Execution } from '@/types/database';

interface ExecutionState {
  currentExecution: Execution | null;
  isExecuting: boolean;
  setCurrentExecution: (execution: Execution | null) => void;
  setIsExecuting: (value: boolean) => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  currentExecution: null,
  isExecuting: false,
  setCurrentExecution: (execution) => set({ currentExecution: execution }),
  setIsExecuting: (value) => set({ isExecuting: value }),
  clearExecution: () => set({ currentExecution: null, isExecuting: false }),
}));
