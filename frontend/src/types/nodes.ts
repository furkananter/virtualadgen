import type { NodeExecutionStatus } from './database';

export interface NodeData {
  label: string;
  config: Record<string, unknown>;
  has_breakpoint?: boolean;
  status?: NodeExecutionStatus;
  execution_error?: string;
  execution_data?: Record<string, unknown> | null;
}
