export interface NodeData {
  label: string;
  config: Record<string, unknown>;
  has_breakpoint?: boolean;
  status?: string;
  execution_error?: string;
  execution_data?: any;
}
