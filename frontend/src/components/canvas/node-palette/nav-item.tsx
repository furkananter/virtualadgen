import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItemProps {
    to?: string;
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    className?: string;
    sidebarCollapsed: boolean;
}

export const NavItem = ({
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
                "flex items-center gap-3 p-2.5 rounded-[16px] transition-all duration-200 group relative",
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
