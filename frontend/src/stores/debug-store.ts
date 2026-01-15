import { create } from 'zustand';
import type { NodeExecution } from '@/types/database';

interface DebugState {
  nodeExecutions: Map<string, NodeExecution>;
  isPaused: boolean;
  setNodeExecution: (nodeId: string, execution: NodeExecution) => void;
  setIsPaused: (value: boolean) => void;
  clearNodeExecutions: () => void;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  nodeExecutions: new Map(),
  isPaused: false,
  setNodeExecution: (nodeId, execution) => {
    const newMap = new Map(get().nodeExecutions);
    newMap.set(nodeId, execution);
    set({ nodeExecutions: newMap });
  },
  setIsPaused: (value) => set({ isPaused: value }),
  clearNodeExecutions: () => set({ nodeExecutions: new Map(), isPaused: false }),
}));
