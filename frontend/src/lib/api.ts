import axios from 'axios';
import { supabase } from '@/config/supabase';
import { 
  ExecuteWorkflowResponse, 
  StepExecutionResponse, 
  CancelExecutionResponse, 
  RedditRequest, 
  RedditResponse 
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const workflowApi = {
  execute: async (workflowId: string): Promise<ExecuteWorkflowResponse> => {
    const { data } = await api.post(`/api/workflows/${workflowId}/execute`);
    return data;
  },
  step: async (executionId: string): Promise<StepExecutionResponse> => {
    const { data } = await api.post(`/api/executions/${executionId}/step`);
    return data;
  },
  cancel: async (executionId: string): Promise<CancelExecutionResponse> => {
    const { data } = await api.post(`/api/executions/${executionId}/cancel`);
    return data;
  },
};

export const socialApi = {
  getReddit: async (params: RedditRequest): Promise<RedditResponse> => {
    const { data } = await api.post('/api/social/reddit', params);
    return data;
  },
};

export default api;
