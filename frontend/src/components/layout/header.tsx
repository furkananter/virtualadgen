import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Layers } from 'lucide-react';
import { logout } from '@/lib/supabase';

export const Header = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isLanding
      ? 'bg-background/80 backdrop-blur-md border-border/10'
      : 'bg-background/80 backdrop-blur-md border-border'
      }`}>
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to={user ? "/workflows" : "/"} className="flex items-center group">
            <span className="logo-text text-[20px] sm:text-[22px] tracking-[0.05em] font-semibold text-foreground flex items-baseline">
              Visual<span className="text-primary font-extrabold">Ad</span><span className="font-light opacity-80">Gen</span>
            </span>
          </Link>

          {user && (
            <nav className="flex items-center gap-1">
              <NavLink to="/workflows" active={location.pathname === '/workflows'}>
                <Layers className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:inline">Workflows</span>
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 border-r border-border">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full ring-2 ring-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name || ''} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold leading-none text-foreground">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium lowercase truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8 sm:h-9 sm:w-9"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/login">
                <Button className="rounded-full px-4 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm font-bold transition-all shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, children, active }: { to: string, children: React.ReactNode, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
  >
    {children}
  </Link>
);
