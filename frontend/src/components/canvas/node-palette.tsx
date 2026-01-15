import type { DragEvent, ReactNode } from 'react';
import {
  Type,
  Image as ImageIcon,
  Share2,
  PenTool,
  Brain,
  Download,
  LayoutGrid,
  User as UserIcon,
  LogOut,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import type { NodeType } from '@/types/database';
import { Squircle } from '@squircle-js/react';
import { useAuthStore } from '@/stores/auth-store';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { supabase } from '@/config/supabase';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface NodeConfig {
  label: string;
  icon: ReactNode;
}

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  TEXT_INPUT: { label: 'Text Input', icon: <Type className="h-4 w-4" /> },
  IMAGE_INPUT: { label: 'Image Input', icon: <ImageIcon className="h-4 w-4" /> },
  SOCIAL_MEDIA: { label: 'Social Media', icon: <Share2 className="h-4 w-4" /> },
  PROMPT: { label: 'Prompt Template', icon: <PenTool className="h-4 w-4" /> },
  IMAGE_MODEL: { label: 'Image Model', icon: <Brain className="h-4 w-4" /> },
  OUTPUT: { label: 'Output', icon: <Download className="h-4 w-4" /> },
};

const NODE_TYPES = Object.entries(NODE_CONFIGS).map(([type, config]) => ({
  type: type as NodeType,
  ...config
}));

export const NodePalette = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="h-full border-r bg-card/30 backdrop-blur-3xl flex flex-col w-64 select-none">
      {/* Brand area */}
      <div className="p-6 pb-4 flex items-center gap-3 border-b border-border/10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg shadow-foreground/10">
            <span className="text-background font-black text-xl italic leading-none select-none">V</span>
          </div>
          <span className="font-black text-xl tracking-tighter italic">VisualAdGen</span>
        </Link>
      </div>

      {/* Navigation section */}
      <div className="px-4 py-3 flex flex-col gap-1.5 overflow-y-auto no-scrollbar flex-1">
        <Link to="/workflows">
          <Squircle
            cornerRadius={14}
            cornerSmoothing={1}
            className="flex items-center gap-3 p-3 w-full bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20 transition-all group active:scale-95"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-bold tracking-tight">All Workflows</span>
          </Squircle>
        </Link>

        {/* Library header */}
        <div className="mt-6 mb-2 flex items-center justify-between px-2 text-muted-foreground/50">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em]">
            Library
          </h2>
        </div>

        {/* Draggable nodes */}
        <div className="flex flex-col gap-2">
          {NODE_TYPES.map((node) => (
            <Squircle
              key={node.type}
              cornerRadius={12}
              cornerSmoothing={1}
              draggable
              onDragStart={(e) => onDragStart(e as any, node.type)}
              className="flex items-center gap-3 p-3 border border-border/40 bg-card/50 hover:bg-card hover:border-sidebar-ring cursor-grab hover:shadow-sm transition-all active:cursor-grabbing group active:scale-[0.98]"
            >
              <div className="text-muted-foreground group-hover:text-primary transition-colors">{node.icon}</div>
              <span className="text-xs font-semibold">{node.label}</span>
            </Squircle>
          ))}
        </div>
      </div>

      {/* Account bottom section using Radix Popover */}
      <div className="p-4 border-t bg-muted/10">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 p-2 w-full transition-all active:scale-95 hover:opacity-100 opacity-80 group text-left outline-none cursor-pointer">
              <Squircle cornerRadius={12} cornerSmoothing={1} className="w-10 h-10 border border-border shadow-sm overflow-hidden shrink-0 group-hover:border-primary transition-colors">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </Squircle>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold truncate leading-none mb-1">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none">
                  Free Plan
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={12}
            className="w-60 p-0! bg-popover/80 backdrop-blur-2xl border-border/40 overflow-hidden shadow-2xl"
          >
            <Squircle cornerRadius={16} cornerSmoothing={1} className="flex flex-col gap-1 overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <p className="text-xs font-bold truncate leading-none mb-1.5">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>

              <div className="p-1.5 flex flex-col gap-1">
                <button className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-left outline-none cursor-pointer group">
                  <UserIcon className="h-4 w-4 opacity-60 group-hover:opacity-100" /> Account
                </button>
                <button className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-left outline-none cursor-pointer group">
                  <CreditCard className="h-4 w-4 opacity-60 group-hover:opacity-100" /> Billing
                </button>

                <div className="px-3 py-2 flex items-center justify-between border-t border-dashed mt-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">Theme</span>
                  <ThemeToggle />
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all text-left mt-1 outline-none cursor-pointer scale-100 active:scale-95"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </Squircle>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
};
