# VisualAdGen - Frontend Development

## Project Overview

Visual Workflow Builder for Ad Generation. Users create ad images through a node-based interface. This is a take-home assignment focusing on architecture and system design.

## Important Context

- This is a monorepo project using pnpm workspaces
- Frontend folder already exists with React + Vite + shadcn/ui installed
- Backend is being developed separately (Python + FastAPI)
- Running `pnpm run dev` from root starts both frontend and backend

## Tech Stack

- React 18 + Vite + TypeScript (already set up)
- React Router Dom v6 (routing)
- Zustand (state management)
- TanStack Query v5 (data fetching & caching)
- React Flow (node-based canvas)
- shadcn/ui + Tailwind CSS (already set up)
- Supabase JS Client (auth, database, realtime)

## Critical Rules

1. Each file must serve a SINGLE purpose
2. No file should exceed 300 lines
3. Modular and reusable structure is mandatory
4. Use kebab-case for file names (e.g., workflow-canvas.tsx)
5. Each component must have its own file
6. Avoid Context API - use Zustand instead
7. Type everything - no 'any' types allowed

## Folder Structure

```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── config/
│   │   └── supabase.ts
│   ├── components/
│   │   ├── ui/                     # shadcn components (already exists)
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-container.tsx
│   │   ├── auth/
│   │   │   └── google-login-button.tsx
│   │   ├── workflow/
│   │   │   ├── workflow-card.tsx
│   │   │   └── workflow-list.tsx
│   │   ├── canvas/
│   │   │   ├── workflow-canvas.tsx
│   │   │   ├── node-palette.tsx
│   │   │   └── canvas-toolbar.tsx
│   │   ├── nodes/
│   │   │   ├── base-node.tsx
│   │   │   ├── text-input-node.tsx
│   │   │   ├── image-input-node.tsx
│   │   │   ├── social-media-node.tsx
│   │   │   ├── prompt-node.tsx
│   │   │   ├── image-model-node.tsx
│   │   │   └── output-node.tsx
│   │   ├── debug/
│   │   │   ├── debug-panel.tsx
│   │   │   ├── node-inspector.tsx
│   │   │   └── execution-controls.tsx
│   │   ├── config-panels/
│   │   │   ├── text-input-config.tsx
│   │   │   ├── image-input-config.tsx
│   │   │   ├── social-media-config.tsx
│   │   │   ├── prompt-config.tsx
│   │   │   ├── image-model-config.tsx
│   │   │   └── output-config.tsx
│   │   └── history/
│   │       ├── execution-list.tsx
│   │       └── generation-gallery.tsx
│   ├── pages/
│   │   ├── landing.tsx
│   │   ├── login.tsx
│   │   ├── workflows.tsx
│   │   ├── workflow-editor.tsx
│   │   └── workflow-history.tsx
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── workflow-store.ts
│   │   ├── canvas-store.ts
│   │   ├── execution-store.ts
│   │   └── debug-store.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-realtime.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   ├── queries/
│   │   │   ├── use-workflows-query.ts
│   │   │   ├── use-workflow-query.ts
│   │   │   ├── use-executions-query.ts
│   │   │   └── use-generations-query.ts
│   │   └── mutations/
│   │       ├── use-create-workflow.ts
│   │       ├── use-update-workflow.ts
│   │       ├── use-delete-workflow.ts
│   │       └── use-execute-workflow.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── nodes.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## Routes

| Route | Page | Auth Required |
|-------|------|---------------|
| / | Landing | No |
| /login | Login | No |
| /workflows | Workflow list | Yes |
| /workflows/new | New workflow editor | Yes |
| /workflows/:id | Workflow editor | Yes |
| /workflows/:id/history | Execution history | Yes |

## Database Types

```typescript
// types/database.ts

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
```

## Node Config Types

```typescript
// types/nodes.ts

export interface TextInputConfig {
  label: string;
  value: string;
  placeholder?: string;
}

export interface ImageInputConfig {
  label: string;
  image_url: string;
  description?: string;
}

export interface SocialMediaConfig {
  platform: 'reddit';
  subreddit: string;
  sort: 'hot' | 'new' | 'top';
  limit: number;
}

export interface PromptConfig {
  template: string;
}

export interface ImageModelConfig {
  model: 'fal-ai/flux/schnell' | 'fal-ai/flux/dev' | 'fal-ai/stable-diffusion-xl';
  parameters: {
    steps: number;
    guidance_scale: number;
    seed: number | null;
  };
}

export interface OutputConfig {
  num_images: number;
  aspect_ratio: '1:1' | '4:5' | '9:16';
  output_format: 'png' | 'jpeg';
}

export type NodeConfig = 
  | TextInputConfig 
  | ImageInputConfig 
  | SocialMediaConfig 
  | PromptConfig 
  | ImageModelConfig 
  | OutputConfig;
```

## API Types

```typescript
// types/api.ts

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
```

## Backend API Endpoints

Base URL: `http://localhost:8000` (configurable via env)

### POST /api/workflows/{workflow_id}/execute

Starts workflow execution.

Response:
```json
{
  "execution_id": "uuid",
  "status": "RUNNING"
}
```

### POST /api/executions/{execution_id}/step

Continues from breakpoint to next node.

Response:
```json
{
  "execution_id": "uuid",
  "status": "RUNNING | PAUSED | COMPLETED",
  "current_node_id": "uuid | null"
}
```

### POST /api/executions/{execution_id}/cancel

Cancels running execution.

Response:
```json
{
  "execution_id": "uuid",
  "status": "CANCELLED"
}
```

### POST /api/social/reddit

Fetches Reddit data (for preview in social media node).

Request:
```json
{
  "subreddit": "technology",
  "sort": "hot",
  "limit": 10
}
```

Response:
```json
{
  "posts": [
    {
      "title": "...",
      "score": 1234,
      "url": "...",
      "num_comments": 56
    }
  ],
  "trends": ["AI", "tech", "..."]
}
```

## Supabase Client Setup

```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## Supabase Operations

Frontend directly communicates with Supabase for:

- **Auth**: signInWithOAuth (Google), signOut, getSession, onAuthStateChange
- **Workflows**: select, insert, update, delete
- **Nodes**: select, insert, update, delete, upsert
- **Edges**: select, insert, delete
- **Executions**: select (read only)
- **NodeExecutions**: select (read only)
- **Generations**: select (read only)

## Realtime Subscriptions

Subscribe to node_executions table for live debugging:

```typescript
// When execution starts
supabase
  .channel('node-executions')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'node_executions',
      filter: `execution_id=eq.${executionId}`
    },
    (payload) => {
      // Update debug store with new node execution state
    }
  )
  .subscribe();
```

## Zustand Stores

### auth-store.ts
- user: User | null
- isLoading: boolean
- setUser(user): void
- clearUser(): void

### workflow-store.ts
- workflows: Workflow[]
- currentWorkflow: Workflow | null
- setWorkflows(workflows): void
- setCurrentWorkflow(workflow): void
- clearCurrentWorkflow(): void

### canvas-store.ts
- nodes: ReactFlowNode[]
- edges: ReactFlowEdge[]
- selectedNodeId: string | null
- setNodes(nodes): void
- setEdges(edges): void
- addNode(node): void
- updateNode(id, data): void
- deleteNode(id): void
- addEdge(edge): void
- deleteEdge(id): void
- setSelectedNodeId(id): void

### execution-store.ts
- currentExecution: Execution | null
- isExecuting: boolean
- setCurrentExecution(execution): void
- setIsExecuting(value): void
- clearExecution(): void

### debug-store.ts
- nodeExecutions: Map<string, NodeExecution>
- isPaused: boolean
- setNodeExecution(nodeId, execution): void
- setIsPaused(value): void
- clearNodeExecutions(): void

## TanStack Query Setup

Wrap App with QueryClientProvider:

```typescript
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## React Flow Integration

### Custom Nodes

Each node type has its own component:

- Render node UI with inputs/outputs handles
- Show node name and status indicator
- Display breakpoint indicator if has_breakpoint is true
- On click, set as selected node in canvas-store

### Node Palette

- Display draggable node types
- On drag end over canvas, create new node at drop position

### Canvas Toolbar

- Run button: Execute workflow
- Debug toggle: Enable/disable debug mode
- Step button: Step through breakpoints (visible when paused)
- Save button: Save workflow to Supabase

## UI Components Needed

### Pages

1. **Landing**: Hero section, features, CTA button to login
2. **Login**: Google OAuth button, redirect to /workflows on success
3. **Workflows**: Grid of workflow cards, "New Workflow" button
4. **Workflow Editor**: Full-page canvas with sidebars
5. **Workflow History**: List of executions with generated images

### Layout

- **Header**: Logo, user avatar, logout button
- **Sidebar** (editor): Node palette OR config panel based on selection
- **Page Container**: Consistent padding and max-width

### Workflow Editor Layout

```
┌─────────────────────────────────────────────────────┐
│                      Header                          │
├──────────┬──────────────────────────────┬───────────┤
│          │                              │           │
│  Node    │                              │  Config   │
│  Palette │        React Flow            │  Panel    │
│          │         Canvas               │           │
│          │                              │           │
├──────────┴──────────────────────────────┴───────────┤
│                   Debug Panel                        │
└─────────────────────────────────────────────────────┘
```

## Environment Variables

Create `.env`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
VITE_BACKEND_URL=http://localhost:8000
```

## Dependencies to Install

```bash
pnpm add @supabase/supabase-js
pnpm add zustand
pnpm add @tanstack/react-query
pnpm add reactflow
pnpm add react-router-dom
```

## Important Notes

1. UI doesn't need to be beautiful - functional is enough
2. Focus on clean, modular code structure
3. All CRUD operations go through Supabase client directly
4. Backend is only called for: execution, step, cancel, social media fetch
5. Use Supabase Realtime for live debugging updates
6. Protect routes that require auth with a route guard
7. Handle loading and error states in all queries/mutations
