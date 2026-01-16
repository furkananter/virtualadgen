# Backend — VisualAdGen

FastAPI backend for workflow execution, image generation, and social media integration.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT validation) |
| Image Gen | FAL AI (FLUX, SDXL) |
| HTTP Client | httpx (async) |

---

## 🚀 Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

Create `.env` file:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_API_KEY=eyJ...
FAL_KEY=fal_...
RAPID_API_KEY=xxx  # Optional, Reddit fallback
```

---

## 📁 Directory Structure

```
app/
├── main.py                 # FastAPI app entry point
│
├── api/
│   ├── deps.py             # Dependency injection (auth)
│   └── routes/
│       ├── execution.py    # /workflows/{id}/execute, /executions/{id}/step
│       └── social.py       # /social/reddit
│
├── models/
│   ├── enums.py            # NodeType, ExecutionStatus, etc.
│   └── schemas.py          # Pydantic request/response models
│
├── services/
│   ├── fal_ai.py           # FAL AI image generation
│   │
│   ├── workflow_engine/    # Execution orchestration
│   │   ├── __init__.py     # Public API (WorkflowEngine)
│   │   ├── engine.py       # prepare_execution, step_execution
│   │   ├── runner.py       # ExecutionRunner (node loop)
│   │   └── helpers.py      # topological_sort, gather_inputs
│   │
│   ├── node_executors/     # Per-node-type execution logic
│   │   ├── base.py         # BaseNodeExecutor abstract class
│   │   ├── text_input.py
│   │   ├── image_input.py
│   │   ├── social_media.py
│   │   ├── prompt.py
│   │   ├── image_model.py
│   │   └── output.py
│   │
│   ├── reddit/             # Reddit API integration
│   │   ├── client.py       # fetch_subreddit_posts
│   │   ├── analyzer.py     # extract_insights
│   │   ├── validator.py    # subreddit name validation
│   │   └── constants.py    # fallback data
│   │
│   └── supabase/           # Database operations
│       ├── client.py       # Supabase client init
│       ├── workflows.py    # CRUD for workflows
│       ├── nodes.py        # CRUD for nodes
│       ├── executions.py   # Execution state management
│       └── generations.py  # Store generated images
│
├── config/
│   └── settings.py         # Pydantic settings (env vars)
│
└── utils/
    └── cost_calculator.py  # Per-model cost estimation
```

---

## 🔌 API Endpoints

### Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/workflows/{id}/execute` | Start workflow execution |
| `POST` | `/api/executions/{id}/step` | Step through from breakpoint |
| `POST` | `/api/executions/{id}/cancel` | Cancel running execution |

### Social Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/social/reddit` | Fetch subreddit posts & trends |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |

---

## ⚙️ Workflow Engine

### Execution Flow

```
1. prepare_execution()
   ├── Validate workflow ownership
   ├── Fetch nodes and edges from DB
   ├── Topologically sort nodes
   └── Create execution + node_execution records

2. run()  [background task]
   ├── Loop through sorted nodes
   ├── Check breakpoints → pause if hit
   ├── Gather inputs from upstream nodes
   ├── Execute node via NodeExecutor
   ├── Store output in node_execution
   └── Update execution status on completion

3. step_execution()  [called when paused]
   ├── Execute current paused node
   └── Pause at next node
```

### Topological Sort

Nodes are sorted using Kahn's algorithm to ensure:
- Upstream nodes execute before downstream
- Cycles are detected (would error)

### Node Executors

Each node type has a dedicated executor:

```python
class ImageModelExecutor(BaseNodeExecutor):
    async def execute(self, inputs, config, context):
        prompt = inputs.get("prompt")
        result = await fal_ai.generate_images(...)
        return {"image_urls": result["image_urls"]}
```

**Input merging**: When a node has multiple upstream connections, inputs are merged:

```python
def merge_inputs(self, inputs: dict) -> dict:
    merged = {}
    for source_data in inputs.values():
        merged.update(source_data)
    return merged
```

---

## 🖼️ Image Generation

### Supported Models

| Model ID | Name | Price/Image |
|----------|------|-------------|
| `fal-ai/flux/schnell` | FLUX Schnell | $0.003 |
| `fal-ai/flux/dev` | FLUX Dev | $0.025 |
| `fal-ai/stable-diffusion-xl` | SDXL | $0.002 |

### Parameters

```python
{
    "prompt": str,
    "num_images": int,      # 1-4
    "aspect_ratio": str,    # "1:1", "4:5", "9:16"
    "guidance_scale": float,
    "num_inference_steps": int,
    "seed": int | None
}
```

---

## 🔐 Authentication

JWT tokens from Supabase Auth are validated via:

```python
# api/deps.py
async def get_current_user(credentials):
    token = credentials.credentials
    response = supabase.auth.get_user(token)
    return {"id": response.user.id, "email": response.user.email}

# Usage in routes
@router.post("/workflows/{id}/execute")
async def execute(id: str, current_user: CurrentUser):
    ...
```

All workflows are scoped to the authenticated user via RLS policies.

---

## 📡 Reddit Integration

### Primary: Direct API

```python
# Uses old.reddit.com (less aggressive blocking)
response = await client.get(
    f"https://old.reddit.com/r/{subreddit}/hot.json",
    headers=randomized_headers
)
```

### Fallback: Socialgrep (RapidAPI)

If Reddit blocks the request, falls back to Socialgrep API.

### Final Fallback: Static Data

If both fail, returns curated static trends for common subreddits.

---

## 🗄️ Database Schema

See `supabase_schema.sql` for full schema.

### Key Tables

| Table | Description |
|-------|-------------|
| `workflows` | User's saved workflows |
| `nodes` | Node definitions (type, position, config) |
| `edges` | Connections between nodes |
| `executions` | Workflow run history |
| `node_executions` | Per-node execution state |
| `generations` | Generated images |

### Row Level Security

All tables have RLS policies ensuring users can only access their own data:

```sql
create policy "Users can CRUD own workflows" on workflows
  for all using (auth.uid() = user_id);
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Dev server with hot reload |
| `python -m pytest` | Run tests (when added) |

---

## 🚢 Deployment

### Railway / Render

```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Environment

Set all env vars in the deployment platform's dashboard.
