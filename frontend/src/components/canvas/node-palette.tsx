import type { DragEvent, ReactNode } from 'react';
import {
  LayoutGrid,
  User as UserIcon,
  LogOut,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  History,
} from 'lucide-react';
import type { NodeType } from '@/types/database';
import { useAuthStore } from '@/stores/auth-store';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { supabase } from '@/config/supabase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCanvasStore } from '@/stores/canvas-store';
import { toast } from 'sonner';
import { generateMagicTemplate } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { NODE_CONFIGS } from './node-configs';

const NODE_TYPES = Object.entries(NODE_CONFIGS).map(([type, config]) => ({
  type: type as NodeType,
  ...config,
}));

interface NavItemProps {
  to?: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  sidebarCollapsed: boolean;
}

const NavItem = ({
  to,
  icon,
  label,
  onClick,
  className,
  sidebarCollapsed,
}: NavItemProps) => {
  const content = (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group relative",
        "hover:bg-muted/50 active:scale-95 text-muted-foreground hover:text-foreground",
        sidebarCollapsed ? "justify-center" : "",
        className
      )}
      title={sidebarCollapsed ? label : undefined}
    >
      <div className="shrink-0 transition-transform group-hover:scale-110">{icon}</div>
      {!sidebarCollapsed && <span className="text-sm font-semibold truncate tracking-tight">{label}</span>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="w-full">
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className="w-full text-left">
      {content}
    </button>
  );
};

export const NodePalette = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { setNodes, setEdges, setSelectedNodeId, sidebarCollapsed, setSidebarCollapsed } = useCanvasStore();

  const handleCreateExample = () => {
    const { nodes, edges } = generateMagicTemplate();
    setNodes(nodes);
    setEdges(edges);
    setSelectedNodeId(null);
    toast.success('Example workflow generated!');
  };

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "h-full border-r bg-card/10 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out select-none relative",
      sidebarCollapsed ? "w-20" : "w-64"
    )}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-12 w-6 h-6 bg-card border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm z-50 group"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
        )}
      </button>

      {/* Logo Section */}
      <div className={cn(
        "p-6 flex items-center transition-all duration-300",
        sidebarCollapsed ? "justify-center px-4" : "gap-3"
      )}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg shadow-foreground/5">
            <span className="text-background font-black text-xl italic leading-none">V</span>
          </div>
          {!sidebarCollapsed && <span className="font-black text-xl tracking-tighter italic">VisualAdGen</span>}
        </Link>
      </div>

      <div className="px-3 py-2 flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1">
        <NavItem
          to="/workflows"
          icon={<LayoutGrid className="h-4 w-4" />}
          label="All Workflows"
          sidebarCollapsed={sidebarCollapsed}
        />

        {id && (
          <div className="flex flex-col gap-1 border-t border-border/5 pt-2 mt-1">
            <NavItem
              to={`/workflows/${id}/history`}
              icon={<History className="h-4 w-4" />}
              label="Archives"
              sidebarCollapsed={sidebarCollapsed}
            />
            <NavItem
              onClick={handleCreateExample}
              icon={<Sparkles className="h-4 w-4 text-primary" />}
              label="Magic Template"
              className="hover:bg-primary/5 hover:text-primary"
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        )}

        <div className={cn(
          "mt-6 mb-2 flex items-center justify-between px-3 text-muted-foreground/30",
          sidebarCollapsed ? "justify-center" : ""
        )}>
          {sidebarCollapsed ? (
            <div className="w-4 h-px bg-border/20" />
          ) : (
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">Library</h2>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            const dragItem = (
              <div
                key={node.type}
                draggable
                onDragStart={(event) => onDragStart(event, node.type)}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all duration-200 cursor-grab active:cursor-grabbing group",
                  "hover:bg-muted/50 hover:border-border/50 hover:shadow-sm active:scale-[0.98]",
                  sidebarCollapsed ? "justify-center" : ""
                )}
                title={sidebarCollapsed ? node.label : undefined}
              >
                <div className="text-muted-foreground group-hover:text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && <span className="text-xs font-semibold">{node.label}</span>}
              </div>
            );

            return dragItem;
          })}
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t bg-muted/5 mt-auto">
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "flex items-center gap-3 p-2 w-full rounded-xl transition-all hover:bg-muted/50 text-left outline-none cursor-pointer group",
              sidebarCollapsed ? "justify-center" : ""
            )}>
              <div className="w-9 h-9 rounded-xl border border-border/50 shadow-sm overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/5 flex items-center justify-center font-bold text-primary/70 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold truncate leading-none mb-1">{user?.name || 'User'}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/60 leading-none">Free Plan</span>
                </div>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent side="right" align="end" sideOffset={12} className="w-60 p-1 bg-popover/80 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-border/5 bg-muted/20 rounded-t-xl mb-1">
              <p className="text-xs font-bold truncate leading-none mb-1">{user?.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <button className="flex items-center gap-3 px-3 py-2 text-xs font-semibold hover:bg-primary/5 hover:text-primary rounded-lg transition-all text-left outline-none group">
                <UserIcon className="h-4 w-4 opacity-40 group-hover:opacity-100" /> Account
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-xs font-semibold hover:bg-primary/5 hover:text-primary rounded-lg transition-all text-left outline-none group">
                <CreditCard className="h-4 w-4 opacity-40 group-hover:opacity-100" /> Billing
              </button>
              <div className="px-3 py-2 flex items-center justify-between border-t border-dashed border-border/10 my-1">
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Theme</span>
                <ThemeToggle />
              </div>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-lg transition-all text-left group">
                <LogOut className="h-4 w-4 opacity-60 group-hover:opacity-100" /> Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
};

