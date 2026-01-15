import type { ExecutionStatus } from './database';

export interface ExecuteWorkflowResponse {
  execution_id: string;
  status: ExecutionStatus;
}

export interface StepExecutionResponse {
  execution_id: string;
  status: ExecutionStatus;
  current_node_id: string | null;
}

export interface CancelExecutionResponse {
  execution_id: string;
  status: 'CANCELLED';
}

export interface RedditRequest {
  subreddit: string;
  sort: 'hot' | 'new' | 'top';
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
