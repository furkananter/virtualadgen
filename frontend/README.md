# Frontend — VisualAdGen

React + TypeScript application for the visual workflow builder.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (local) + TanStack Query (server) |
| Canvas | React Flow |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |

---

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
pnpm tsc --noEmit

# Build for production
pnpm build
```

### Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BACKEND_URL=http://localhost:8000
```

---

## 📁 Directory Structure

```
src/
├── components/
│   ├── nodes/              # React Flow node components
│   │   ├── base-node.tsx   # Shared node wrapper (handles, status, debug)
│   │   ├── text-input-node.tsx
│   │   ├── image-input-node.tsx
│   │   ├── social-media-node.tsx
│   │   ├── prompt-node.tsx
│   │   ├── image-model-node.tsx
│   │   └── output-node.tsx
│   │
│   ├── config-panels/      # Node configuration sidebars
│   │   ├── index.tsx       # Panel router by node type
│   │   ├── text-input-config.tsx
│   │   ├── image-model-config.tsx
│   │   ├── output-config.tsx
│   │   └── ...
│   │
│   ├── canvas/             # Workflow canvas components
│   │   ├── workflow-canvas.tsx  # Main React Flow canvas
│   │   ├── canvas-toolbar.tsx   # Run/Save/Debug buttons
│   │   ├── node-palette.tsx     # Draggable node list
│   │   └── node-context-menu.tsx
│   │
│   ├── debug/              # Debugging components
│   │   └── node-inspector.tsx   # View node input/output
│   │
│   ├── history/            # Execution history
│   │   ├── execution-card.tsx
│   │   └── execution-gallery.tsx
│   │
│   ├── layout/             # Page layout components
│   ├── auth/               # Auth components
│   └── ui/                 # shadcn/ui primitives
│
├── pages/
│   ├── landing.tsx         # Marketing landing page
│   ├── login.tsx           # Auth page
│   ├── workflows.tsx       # Workflow list
│   ├── workflow-editor.tsx # Canvas editor
│   └── workflow-history.tsx
│
├── stores/                 # Zustand stores
│   ├── canvas-store.ts     # Nodes, edges, selection
│   ├── execution-store.ts  # Current execution state
│   ├── debug-store.ts      # Debug mode, node executions
│   └── auth-store.ts       # User session
│
├── lib/
│   ├── api.ts              # Axios instance for backend
│   ├── mutations/          # TanStack Query mutations
│   │   ├── use-execute-workflow.ts
│   │   ├── use-save-workflow.ts
│   │   ├── use-step-execution.ts
│   │   └── ...
│   ├── queries/            # TanStack Query queries
│   │   ├── use-workflow-query.ts
│   │   ├── use-workflows-query.ts
│   │   └── use-executions-query.ts
│   └── supabase/           # Direct Supabase operations
│
├── hooks/
│   └── use-realtime.ts     # Supabase Realtime subscription
│
├── types/
│   ├── database.ts         # DB entity types
│   ├── nodes.ts            # Node data types
│   └── api.ts              # API response types
│
└── config/
    └── supabase.ts         # Supabase client init
```

---

## 🧩 Component Architecture

### Node System

All nodes extend `BaseNode` which provides:
- Connection handles (left = input, right = output)
- Status indicator (pending/running/completed/failed)
- Breakpoint badge
- Debug popover (node ID, raw output)
- Context menu (delete, toggle breakpoint)

```tsx
// Example: Creating a new node type
export const MyNode = (props: NodeProps<NodeData>) => (
  <BaseNode title="My Node" icon={<Icon />} {...props}>
    {/* Node-specific content */}
  </BaseNode>
);
```

### State Management

| Store | Purpose | Persistence |
|-------|---------|-------------|
| `canvasStore` | Nodes, edges, selection | Synced to DB on save |
| `executionStore` | Current execution ID/status | Memory only |
| `debugStore` | Debug mode, node execution data | Memory only |
| `authStore` | User session | Supabase handles |

### Data Flow

```
User Action
    │
    ▼
Zustand Store (local state)
    │
    ▼
TanStack Mutation (API call)
    │
    ▼
Backend Response
    │
    ▼
setQueryData (direct cache update)
    │
    ▼
UI Re-render
```

> **Note**: We use `setQueryData` instead of `invalidateQueries` for immediate cache updates without refetching.

---

## 🔌 Realtime Updates

During workflow execution, the app subscribes to Supabase Realtime:

```ts
// use-realtime.ts
supabase.channel(`execution:${executionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'node_executions',
    filter: `execution_id=eq.${executionId}`
  }, handleChange)
  .subscribe();
```

This enables:
- Live status updates per node
- Immediate breakpoint pause detection
- Real-time output data inspection

---

## 🎨 Styling Conventions

- **Design system**: shadcn/ui components with custom theme
- **Dark mode**: Fully supported via CSS variables
- **Spacing**: Tailwind spacing scale (`p-4`, `gap-2`, etc.)
- **Animations**: `animate-in`, `fade-in`, `slide-in-from-*` utilities
- **Glassmorphism**: `backdrop-blur-xl`, `bg-card/40`

### Color Tokens

```css
--primary: Brand accent color
--muted: Secondary backgrounds
--destructive: Error states
--border: Subtle dividers
```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 5173) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm tsc --noEmit` | Type check without emit |
