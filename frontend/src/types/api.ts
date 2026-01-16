import type { ExecutionStatus } from './database';

export interface ExecuteWorkflowResponse {
  execution_id: string;
  status: ExecutionStatus;
  error_message?: string;
}

export interface StepExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
  current_node_id: string | null;
  error_message?: string;
}

export interface CancelExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
}

export interface RedditRequest {
  subreddit: string;
  sort: 'hot' | 'new' | 'top' | 'rising';
  limit: number;
}

export interface RedditPost {
  title: string;
  score: number;
  url: string;
  num_comments: number;
}

export interface RedditResponse {
  posts: RedditPost[];
  trends: string[];
}
