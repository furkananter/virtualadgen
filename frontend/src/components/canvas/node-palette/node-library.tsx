import type { DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeType } from '@/types/database';
import { NODE_CONFIGS } from '../node-configs';

const NODE_TYPES = Object.entries(NODE_CONFIGS).map(([type, config]) => ({
    type: type as NodeType,
    ...config,
}));

export const NodeLibrary = ({
    sidebarCollapsed,
    onDragStart
}: {
    sidebarCollapsed: boolean,
    onDragStart: (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => void
}) => (
    <div className="flex flex-col gap-1">
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

        {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
                <div
                    key={node.type}
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                    className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all duration-200 cursor-grab active:cursor-grabbing group",
                        "hover:bg-muted/50 hover:border-border/50 active:scale-[0.98]",
                        sidebarCollapsed ? "justify-center" : ""
                    )}
                    title={sidebarCollapsed ? node.label : undefined}
                >
                    <div
                        className="transition-transform group-hover:scale-110"
                        style={{ color: node.color }}
                    >
                        <Icon className="h-4 w-4" />
                    </div>
                    {!sidebarCollapsed && (
                        <>
                            <span className="text-xs font-semibold flex-1">{node.label}</span>
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-all duration-200" />
                        </>
                    )}
                </div>
            );
        })}
    </div>
);
