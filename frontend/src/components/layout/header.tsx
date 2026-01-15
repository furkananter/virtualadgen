import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Layers } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export const Header = () => {
  const { user, clearUser } = useAuthStore();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUser();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isLanding
      ? 'bg-background/80 backdrop-blur-md border-border/10'
      : 'bg-background/80 backdrop-blur-md border-border'
      }`}>
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            <span className="text-primary italic">V</span>
            <span className="text-foreground">VisualAdGen</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/workflows" active={location.pathname === '/workflows'}>
                <Layers className="h-4 w-4" />
                Workflows
              </NavLink>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="w-px h-6 bg-border mx-1" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 pr-3 border-r border-border">
                <div className="h-9 w-9 rounded-full ring-2 ring-border overflow-hidden bg-muted flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name || ''} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold leading-none text-foreground">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-1">
                    Free Plan
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors h-9 w-9"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/login">
                <Button className="rounded-full px-6 font-bold transition-all shadow-sm">
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
