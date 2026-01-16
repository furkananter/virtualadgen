import { User as UserIcon, CreditCard, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { cn } from '@/lib/utils';
import type { User } from '@/types/database';

import { useEffect, useState } from 'react';

export const UserSection = ({
    user,
    sidebarCollapsed,
    handleLogout
}: {
    user: User | null,
    sidebarCollapsed: boolean,
    handleLogout: () => Promise<void>
}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="p-3 border-t border-border/40 bg-muted/5 mt-auto">
            <Popover>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "flex items-center gap-3 p-2 w-full rounded-xl transition-all hover:bg-muted/50 text-left outline-none cursor-pointer group",
                        sidebarCollapsed ? "justify-center" : ""
                    )}>
                        <div className="w-9 h-9 rounded-xl border border-border/50 overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
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
                                <span className="text-[9px] font-medium text-muted-foreground/60 leading-none lowercase truncate">
                                    {user?.email}
                                </span>
                            </div>
                        )}
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    side={isMobile ? "top" : "right"}
                    align={isMobile ? "center" : "end"}
                    sideOffset={isMobile ? 12 : 12}
                    className="w-60 p-1 bg-popover/80 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                >
                    <div className="p-3 border-b border-border/5 bg-muted/20 rounded-t-xl mb-1">
                        <p className="text-xs font-bold truncate leading-none mb-1">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'No email set'}</p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <button disabled aria-disabled="true" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left outline-none opacity-40 cursor-not-allowed group">
                            <UserIcon className="h-4 w-4" />
                            <span className="flex-1">Account</span>
                            <span className="text-[8px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Soon</span>
                        </button>
                        <button disabled aria-disabled="true" className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left outline-none opacity-40 cursor-not-allowed group">
                            <CreditCard className="h-4 w-4" />
                            <span className="flex-1">Billing</span>
                            <span className="text-[8px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Soon</span>
                        </button>
                        <div className="px-3 py-2 flex items-center justify-between border-t border-dashed border-border/10 my-1">
                            <span className="text-[10px] uppercase font-bold tracking-widest opacity-30">Theme</span>
                            <ThemeToggle />
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-lg transition-all text-left group">
                            <LogOut className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-transform group-hover:-translate-x-0.5" /> Logout
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
