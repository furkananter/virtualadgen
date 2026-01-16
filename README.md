# VisualAdGen

A visual workflow builder for AI-powered ad generation. Create image ads through a node-based interface with social media integration and real-time debugging.

![Node-based visual workflow builder](https://img.shields.io/badge/React_Flow-Node_Based_UI-blue) ![FastAPI Backend](https://img.shields.io/badge/FastAPI-Backend-green) ![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-orange)

## ✨ Features

### Workflow Canvas
- **Drag & drop nodes** to build generation pipelines
- **6 node types**: Text Input, Image Input, Social Media, Prompt Template, Image Model, Output
- **Real-time connection** validation between nodes
- **Auto-save** workflows to database

### Image Generation
- **3 AI models**: FLUX Schnell, FLUX Dev, Stable Diffusion XL (via FAL AI)
- **Configurable parameters**: guidance scale, steps, seed
- **Multiple outputs**: generate 1-4 images per run
- **Aspect ratios**: 1:1, 4:5, 9:16

### Social Listening
- **Reddit integration** with fallback mechanism
- Fetches trending posts and extracts keywords
- Inject trends into prompts with `{{trends}}` variable

### Debugging
- **Breakpoints** on any node
- **Step-through execution** — advance one node at a time
- **Node inspector** — view input/output data for each node
- **Real-time status** updates via Supabase Realtime

### Backend
- **User authentication** via Supabase Auth
- **Workflow persistence** with RLS policies
- **Generation history** — view past runs with prompts, models, and outputs

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React + TypeScript + React Flow + TanStack Query + Zustand │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│              FastAPI + Async Python + Pydantic               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Database                               │
│          Supabase (PostgreSQL + Auth + Realtime)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│              FAL AI (Image Gen) + Reddit API                 │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User profiles (synced from Supabase Auth) |
| `workflows` | Saved workflows per user |
| `nodes` | Node definitions with position, config, breakpoints |
| `edges` | Connections between nodes |
| `executions` | Workflow run history with status tracking |
| `node_executions` | Per-node execution state (input/output data) |
| `generations` | Generated images with prompts and parameters |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Supabase project
- FAL AI API key

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_SECRET_API_KEY, FAL_KEY

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Database

Run `backend/supabase_schema.sql` in Supabase SQL Editor.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_API_KEY=eyJ...
FAL_KEY=fal_...
RAPID_API_KEY=xxx  # Optional, for Reddit fallback
```

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BACKEND_URL=http://localhost:8000
```

---

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/routes/          # FastAPI endpoints
│   │   ├── models/              # Pydantic schemas & enums
│   │   ├── services/
│   │   │   ├── node_executors/  # Per-node-type execution logic
│   │   │   ├── workflow_engine/ # Orchestration & topological sort
│   │   │   ├── reddit/          # Social media integration
│   │   │   └── supabase/        # Database operations
│   │   └── config/              # Settings & environment
│   └── supabase_schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── nodes/           # React Flow node components
│   │   │   ├── config-panels/   # Node configuration UI
│   │   │   ├── canvas/          # Workflow canvas & toolbar
│   │   │   └── debug/           # Node inspector
│   │   ├── lib/
│   │   │   ├── mutations/       # TanStack Query mutations
│   │   │   ├── queries/         # TanStack Query queries
│   │   │   └── supabase/        # Supabase client helpers
│   │   ├── stores/              # Zustand state management
│   │   └── pages/               # Route pages
│   └── package.json
```

---

## 🎯 Design Decisions

### Why React Flow?
Battle-tested library for node-based UIs with built-in drag/drop, zoom, and connection handling.

### Why Zustand over Redux?
Minimal boilerplate, great TypeScript support, perfect for medium-sized apps.

### Why FAL AI?
Multi-model support (FLUX, SDXL), simple API, pay-per-use pricing.

### Why Supabase?
All-in-one solution: Postgres, Auth, Realtime subscriptions, RLS for security.

### Workflow Execution
Nodes are **topologically sorted** before execution. Each node's output feeds into connected downstream nodes. Breakpoints pause execution and allow step-through debugging.

---

## ⚠️ Known Limitations

> These are intentional scope decisions for a take-home assessment.

| Limitation | Production Solution |
|------------|---------------------|
| **No tests** | Add pytest for backend, Vitest for frontend |
| **No rate limiting** | Use `slowapi` or `fastapi-limiter` |
| **Temp image URLs** | FAL URLs expire; upload to Supabase Storage |
| **In-process execution** | Use Celery + Redis for background jobs |
| **Single social platform** | Add Twitter/TikTok integrations |
| **No workflow versioning** | Snapshot workflow state per execution |

---

## 📄 License

MIT
