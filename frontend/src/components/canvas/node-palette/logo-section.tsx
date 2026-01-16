import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const LogoSection = ({ sidebarCollapsed }: { sidebarCollapsed: boolean }) => (
    <div className={cn(
        "p-6 flex items-center transition-all duration-300",
        sidebarCollapsed ? "justify-center px-0" : "px-6"
    )}>
        <Link to="/" className="flex items-center group">
            {sidebarCollapsed ? (
                <span className="logo-text text-2xl font-extrabold text-primary animate-in fade-in zoom-in duration-500">V</span>
            ) : (
                <span className="logo-text text-[22px] tracking-[0.05em] font-semibold text-foreground flex items-baseline animate-in fade-in slide-in-from-left-4 duration-500">
                    Visual<span className="text-primary font-extrabold">Ad</span><span className="font-light opacity-80">Gen</span>
                </span>
            )}
        </Link>
    </div>
);
