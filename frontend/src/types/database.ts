export type NodeType =
  | 'TEXT_INPUT'
  | 'IMAGE_INPUT'
  | 'SOCIAL_MEDIA'
  | 'PROMPT'
  | 'IMAGE_MODEL'
  | 'OUTPUT';

export type ExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type NodeExecutionStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Node {
  id: string;
  workflow_id: string;
  type: NodeType;
  name: string;
  config: Record<string, unknown>;
  position_x: number;
  position_y: number;
  has_breakpoint: boolean;
  created_at: string;
  updated_at: string;
}

export interface Edge {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  source_handle: string | null;
  target_handle: string | null;
  created_at: string;
}

export interface Execution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  total_cost: number | null;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
}

export interface NodeExecution {
  id: string;
  execution_id: string;
  node_id: string;
  status: NodeExecutionStatus;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface Generation {
  id: string;
  execution_id: string;
  model_id: string;
  prompt: string;
  parameters: Record<string, unknown>;
  image_urls: string[];
  aspect_ratio: string;
  cost: number | null;
  created_at: string;
}
