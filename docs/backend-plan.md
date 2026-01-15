# VisualAdGen - Backend Development

## Project Overview

Visual Workflow Builder for Ad Generation. Users create ad images through a node-based interface. This is a take-home assignment focusing on architecture and system design.

## Important Context

- This is a monorepo project using pnpm workspaces
- Frontend is already set up (React + Vite + shadcn/ui) in `/frontend` folder
- Backend folder is empty and needs to be created from scratch
- Running `pnpm run dev` from root should start both frontend and backend

## Tech Stack

- Python 3.11+ with FastAPI
- Supabase (PostgreSQL, Auth, Storage)
- FAL AI (image generation)
- RapidAPI (Reddit data)

## Critical Rules

1. Each file must serve a SINGLE purpose
2. No file should exceed 300 lines
3. Modular and reusable structure is mandatory
4. Use snake_case (Python convention)
5. Type hints are required for all functions
6. Docstrings are required for all functions and classes

## Monorepo Structure

```
visualadgen/
├── pnpm-workspace.yaml
├── package.json              # Root package.json with dev script
├── frontend/                 # Already exists, don't touch
│   ├── package.json
│   └── ...
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── config/
    │   │   ├── __init__.py
    │   │   └── settings.py
    │   ├── api/
    │   │   ├── __init__.py
    │   │   ├── deps.py
    │   │   └── routes/
    │   │       ├── __init__.py
    │   │       ├── execution.py
    │   │       └── social.py
    │   ├── services/
    │   │   ├── __init__.py
    │   │   ├── workflow_engine.py
    │   │   ├── node_executors/
    │   │   │   ├── __init__.py
    │   │   │   ├── base.py
    │   │   │   ├── text_input.py
    │   │   │   ├── image_input.py
    │   │   │   ├── social_media.py
    │   │   │   ├── prompt.py
    │   │   │   ├── image_model.py
    │   │   │   └── output.py
    │   │   ├── fal_ai.py
    │   │   ├── reddit.py
    │   │   └── supabase.py
    │   ├── models/
    │   │   ├── __init__.py
    │   │   ├── enums.py
    │   │   ├── schemas.py
    │   │   └── database.py
    │   └── utils/
    │       ├── __init__.py
    │       ├── topological_sort.py
    │       └── cost_calculator.py
    ├── requirements.txt
    ├── .env.example
    └── README.md
```

## Root package.json

Create/update root package.json to run both services:

```json
{
  "name": "visualadgen",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm run dev:frontend\" \"pnpm run dev:backend\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "cd backend && uvicorn app.main:app --reload --port 8000"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

## pnpm-workspace.yaml

```yaml
packages:
  - 'frontend'
```

## Database Schema (Supabase)

Create these tables in Supabase dashboard or via SQL:

### users
```sql
create table users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### workflows
```sql
create table workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### nodes
```sql
create type node_type as enum (
  'TEXT_INPUT', 
  'IMAGE_INPUT', 
  'SOCIAL_MEDIA', 
  'PROMPT', 
  'IMAGE_MODEL', 
  'OUTPUT'
);

create table nodes (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  type node_type not null,
  name text not null,
  config jsonb default '{}',
  position_x float default 0,
  position_y float default 0,
  has_breakpoint boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### edges
```sql
create table edges (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  source_node_id uuid references nodes(id) on delete cascade not null,
  target_node_id uuid references nodes(id) on delete cascade not null,
  source_handle text,
  target_handle text,
  created_at timestamptz default now(),
  unique(source_node_id, target_node_id, source_handle, target_handle)
);
```

### executions
```sql
create type execution_status as enum (
  'PENDING', 
  'RUNNING', 
  'PAUSED', 
  'COMPLETED', 
  'FAILED', 
  'CANCELLED'
);

create table executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  status execution_status default 'PENDING',
  total_cost decimal(10,6),
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);
```

### node_executions
```sql
create type node_execution_status as enum (
  'PENDING', 
  'RUNNING', 
  'PAUSED', 
  'COMPLETED', 
  'FAILED', 
  'SKIPPED'
);

create table node_executions (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid references executions(id) on delete cascade not null,
  node_id uuid references nodes(id) on delete cascade not null,
  status node_execution_status default 'PENDING',
  input_data jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  unique(execution_id, node_id)
);
```

### generations
```sql
create table generations (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid references executions(id) on delete cascade not null,
  model_id text not null,
  prompt text not null,
  parameters jsonb default '{}',
  image_urls text[] not null,
  aspect_ratio text not null,
  cost decimal(10,6),
  created_at timestamptz default now()
);
```

## Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS
alter table users enable row level security;
alter table workflows enable row level security;
alter table nodes enable row level security;
alter table edges enable row level security;
alter table executions enable row level security;
alter table node_executions enable row level security;
alter table generations enable row level security;

-- Users policies
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

-- Workflows policies
create policy "Users can CRUD own workflows" on workflows
  for all using (auth.uid() = user_id);

-- Nodes policies
create policy "Users can CRUD nodes of own workflows" on nodes
  for all using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

-- Edges policies
create policy "Users can CRUD edges of own workflows" on edges
  for all using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

-- Executions policies
create policy "Users can view own executions" on executions
  for select using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

-- Node executions policies
create policy "Users can view own node executions" on node_executions
  for select using (
    execution_id in (
      select e.id from executions e
      join workflows w on e.workflow_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Generations policies
create policy "Users can view own generations" on generations
  for select using (
    execution_id in (
      select e.id from executions e
      join workflows w on e.workflow_id = w.id
      where w.user_id = auth.uid()
    )
  );
```

## API Endpoints

### POST /api/workflows/{workflow_id}/execute

Start workflow execution.

Request: None (workflow_id from path)

Response:
```json
{
  "execution_id": "uuid",
  "status": "RUNNING"
}
```

### POST /api/executions/{execution_id}/step

Continue from breakpoint to next node.

Request: None

Response:
```json
{
  "execution_id": "uuid",
  "status": "RUNNING | PAUSED | COMPLETED",
  "current_node_id": "uuid | null"
}
```

### POST /api/executions/{execution_id}/cancel

Cancel running execution.

Response:
```json
{
  "execution_id": "uuid",
  "status": "CANCELLED"
}
```

### POST /api/social/reddit

Fetch Reddit data via RapidAPI.

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

## Workflow Execution Engine Logic

1. Receive workflow_id
2. Fetch workflow with nodes and edges from Supabase
3. Topological sort nodes based on edges (handle parallel nodes)
4. Create execution record (status: RUNNING)
5. Create node_execution records for each node (status: PENDING)
6. For each node in sorted order:
   - Check if node has_breakpoint → set execution status to PAUSED, return
   - Update node_execution status to RUNNING
   - Gather inputs from connected source nodes' outputs
   - Execute node using appropriate executor
   - Save output to node_execution.output_data
   - Update node_execution status to COMPLETED
7. After all nodes complete:
   - Update execution status to COMPLETED
   - Calculate and save total_cost
8. On any error:
   - Update node_execution status to FAILED with error_message
   - Update execution status to FAILED

## Node Executors

Each executor receives inputs dict and config dict, returns output dict.

### TextInputExecutor
- Input: none
- Config: { value: string }
- Output: { text: string }

### ImageInputExecutor
- Input: none
- Config: { image_url: string }
- Output: { image_url: string }

### SocialMediaExecutor
- Input: none
- Config: { platform: "reddit", subreddit: string, sort: string, limit: number }
- Output: { posts: array, trends: array }
- Note: Calls RapidAPI Reddit endpoint

### PromptExecutor
- Input: outputs from connected nodes (merged dict)
- Config: { template: string }
- Output: { prompt: string }
- Note: Template uses {{variable}} syntax, replace with input values

### ImageModelExecutor
- Input: { prompt: string }
- Config: { model: string, parameters: object }
- Output: { image_urls: array, cost: number }
- Note: Calls FAL AI, creates Generation record

### OutputExecutor
- Input: { image_urls: array }
- Config: { num_images: number, aspect_ratio: string }
- Output: { final_images: array }
- Note: Filters/limits images based on config

## FAL AI Integration

Models to support with pricing:
- fal-ai/flux/schnell - $0.003/image
- fal-ai/flux/dev - $0.025/image  
- fal-ai/stable-diffusion-xl - $0.002/megapixel

Use fal-ai Python client. Calculate cost based on model and num_images.

## Auth Flow

1. Frontend sends Supabase JWT in Authorization header: `Bearer <token>`
2. Backend dependency extracts token
3. Call Supabase auth.get_user(token) to verify
4. Extract user_id, attach to request state
5. Use user_id for authorization checks

## Environment Variables

Create `.env.example`:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbG...
SUPABASE_SECRET_API_KEY=eyJhbG...
FAL_KEY=xxx
RAPIDAPI_KEY=xxx
```

## requirements.txt

```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
python-dotenv>=1.0.0
supabase>=2.0.0
fal-client>=0.4.0
httpx>=0.26.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
```

## Important Notes

1. Supabase Realtime is used by frontend for debugging UI - backend just updates node_executions table, frontend subscribes to changes
2. In production, WebSocket could replace Supabase Realtime for better scalability - document this in README
3. This is an assessment - no rate limiting needed
4. Focus on clean architecture over performance optimization
5. All database writes from backend should use SUPABASE_SECRET_API_KEY to bypass RLS
