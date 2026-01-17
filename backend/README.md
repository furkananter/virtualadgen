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
APIFY_API_KEY=apify_api_xxx  # Optional, Reddit fallback via Apify
```

---

## 📁 Directory Structure

```
app/
├── main.py                 # FastAPI app entry point
│
├── api/
│   ├── deps.py             # Dependency injection (auth)
│   ├── background.py       # Background task utilities
│   └── routes/
│       ├── execution.py    # /workflows/{id}/execute, /executions/{id}/step
│       └── social.py       # /social/reddit
│
├── models/
│   ├── enums.py            # NodeType, ExecutionStatus, etc.
│   └── schemas.py          # Pydantic request/response models
│
├── services/
│   ├── fal/                 # FAL AI integration (modular)
│   │   ├── __init__.py     # Public exports
│   │   ├── models.py       # Model configs, pricing, transforms
│   │   └── client.py       # Image generation API client
│   │
│   ├── workflow_engine/    # Execution orchestration
│   │   ├── __init__.py     # Public API (WorkflowEngine)
│   │   ├── engine.py       # prepare_execution, step_execution
│   │   ├── runner.py       # ExecutionRunner (node loop)
│   │   ├── helpers.py      # gather_inputs, run_single_node, utilities
│   │   └── execution_guard.py  # Cancellation check
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
│       ├── executions.py   # Execution state management
│       ├── node_executions.py  # Node execution records
│       ├── generations.py  # Store generated images
│       └── storage.py      # Image upload to Supabase Storage
│
├── config/
│   └── settings.py         # Pydantic settings (env vars)
│
└── utils/
    ├── topological_sort.py # Kahn's algorithm for node ordering
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
| `fal-ai/fast-lightning-sdxl` | SDXL Lightning | $0.002 |
| `fal-ai/nano-banana` | Nano Banana | $0.003 |
| `fal-ai/flux/schnell/redux` | FLUX Redux | $0.025 |
| `fal-ai/fast-lightning-sdxl/image-to-image` | SDXL Lightning Edit | $0.002 |
| `fal-ai/nano-banana/edit` | Nano Banana Edit | $0.003 |


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

### Parameter Normalization

Each model has different API requirements. The `fal/models.py` module handles this automatically:

| Model | Aspect Format | Param Name |
|-------|---------------|------------|
| FLUX Schnell | `square_hd` / `portrait_4_3` | `image_size` |
| SDXL Lightning | `square_hd` / `portrait_4_3` | `image_size` |
| Nano Banana | `1:1` / `9:16` | `aspect_ratio` |
| FLUX Redux | `square_hd` / `portrait_4_3` | `image_size` |
| SDXL Lightning Edit | `square_hd` / `portrait_4_3` | `image_size` |
| Nano Banana Edit | `1:1` / `9:16` | `aspect_ratio` |

Adding a new model requires only adding an entry to `MODELS` dict in `fal/models.py`.

### Image Storage

Generated images are stored in **Supabase Storage** (private bucket) for persistence:

```
FAL AI → Download image → Upload to Supabase Storage → Return signed URL
```

| Feature | Implementation |
|---------|----------------|
| Bucket | `generated-images` (private) |
| Path format | `{user_id}/{uuid}.png` |
| Access | Signed URLs (14-day expiry) |
| RLS | Users can only access own files |

**Why signed URLs?**
- Bucket is private for security
- No public access to user-generated content
- URLs expire after 14 days

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
# Uses reddit.com JSON endpoint
response = await client.get(
    f"https://www.reddit.com/r/{subreddit}/hot.json",
    headers=randomized_headers
)
```

### Fallback: Apify Reddit Scraper

If Reddit blocks the request (403/429), falls back to [Apify Reddit Scraper](https://apify.com/fatihtahta/reddit-scraper).

- **Actor ID**: `TwqHBuZZPHJxiQrTU`
- **Cost**: ~$1.50 per 1,000 posts
- **Reliability**: 100% success rate

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

## 🧪 Testing

> **Why these tests?**  
> Reddit frequently blocks automated requests (403 Forbidden). These tests verify that the triple-fallback mechanism (Reddit → Apify → Static) works correctly, ensuring the Social Media node always returns usable data.

### Unit Tests (Mocked HTTP)

```bash
pytest tests/ -v
```

### Integration Tests (Live API)

Real HTTP calls to Reddit and Apify. Use this to verify API keys and current block status.

```bash
source venv/bin/activate
python scripts/test_reddit_live.py
```

<details>
<summary><strong>Latest Results</strong> (2026-01-16)</summary>

| Subreddit | Source | Status |
|-----------|--------|--------|
| r/SkincareAddiction | Reddit Direct | ✅ 5 posts |
| r/mechanicalkeyboards | Reddit Direct | ✅ 5 posts |
| r/espresso | Reddit Direct | ✅ 5 posts |
| **Apify Fallback** | Apify | ✅ 10 posts (6s) |

</details>


---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `uvicorn app.main:app --reload` | Dev server with hot reload |
| `pytest tests/ -v` | Run all unit tests |
| `python scripts/test_reddit_live.py` | Live Reddit API integration test |

---

## 🚢 Deployment

### Railway / Render

```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Environment

Set all env vars in the deployment platform's dashboard.

---

## 🔮 Production Considerations

> The following improvements were intentionally deferred due to home task scope constraints, but would be prioritized for production:

| Area | Current | Production Improvement |
|------|---------|----------------------|
| **Testing** | Reddit client tests only | Full test coverage with pytest-cov, integration tests |
| **Rate Limiting** | None | Redis-backed rate limiting middleware |
| **Retry Logic** | None | Exponential backoff for FAL AI, Reddit API calls |
| **Error Handling** | Generic exceptions | Custom exception hierarchy with error codes |
| **Monitoring** | Basic logging | Structured logging, APM (Datadog/Sentry) |
| **Caching** | None | Redis cache for Reddit trends, model configs |
| **Queue** | Background tasks | Celery/RQ for long-running image generation |
| **Signed URL Refresh** | 14-day expiry | On-demand URL generation from stored file paths |
| **Config Validation** | JSONB accepts anything | JSON Schema validation per node type |
| **Workflow Versioning** | None | Snapshot workflow state on execution for history integrity |

---

## 🏗️ Schema Design Decisions

The database schema was designed with **flexibility and extensibility** in mind:

### Node Configuration as JSONB

```sql
config jsonb default '{}'
```

Each node type has different configuration requirements. Using JSONB allows:
- **Flexibility**: New node types without schema migrations
- **Extensibility**: Add new config fields without breaking changes
- **Trade-off**: Validation happens at application layer, not database

### Execution State Separation

```
execution (workflow-level) → node_executions (node-level)
```

This separation enables:
- **Breakpoint debugging**: Pause at any node, inspect individual states
- **Partial failure handling**: One node can fail while others complete
- **Step-through execution**: Resume from any paused node

### Generation History

```sql
generations (execution_id, model_id, prompt, parameters, image_urls, cost)
```

Stores complete generation context for:
- **Reproducibility**: Same parameters can recreate similar results
- **Cost tracking**: Per-generation cost for usage analytics
- **Audit trail**: Full history of what was generated and when


