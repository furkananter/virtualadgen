# VisualAdGen Backend

FastAPI backend for the Visual Workflow Builder for Ad Generation.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your actual credentials.

## Running

From the backend directory:
```bash
uvicorn app.main:app --reload --port 8000
```

Or from the project root:
```bash
pnpm run dev:backend
```

## API Endpoints

- `POST /api/workflows/{workflow_id}/execute` - Start workflow execution
- `POST /api/executions/{execution_id}/step` - Continue from breakpoint
- `POST /api/executions/{execution_id}/cancel` - Cancel execution
- `POST /api/social/reddit` - Fetch Reddit data
- `GET /health` - Health check

## Architecture Notes

### Realtime Updates

The frontend uses Supabase Realtime to subscribe to `node_executions` table changes for the debugging UI. The backend simply updates records in the database.

In production, consider replacing Supabase Realtime with WebSocket connections for better scalability and reduced latency.

### Node Execution Flow

1. Workflow execution starts with topological sorting of nodes
2. Each node is executed in order, respecting dependencies
3. Breakpoints pause execution, allowing step-through debugging
4. Node outputs are stored and passed to dependent nodes
