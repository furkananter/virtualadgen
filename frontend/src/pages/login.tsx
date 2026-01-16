import { PageContainer } from '@/components/layout/page-container';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Navigate, Link } from 'react-router-dom';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { Button } from '@/components/ui/button';

export const LoginPage = () => {
  const { user, isLoading } = useAuthStore();

  if (user && !isLoading) {
    return <Navigate to="/workflows" replace />;
  }

  if (isLoading) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-50">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 font-medium hover:bg-muted/50 rounded-xl px-4">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Button>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
        {/* Refined Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] mix-blend-soft-light" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] mix-blend-soft-light" />
        </div>

        {/* Global Grid */}
        <div className="bg-grid absolute inset-0 opacity-[0.05] pointer-events-none" />

        <PageContainer className="relative z-10 w-full max-w-[440px]">
          <div className="animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] rounded-[40px]">
              <div className="p-10 md:p-14">
                <div className="flex flex-col items-center text-center">
                  {/* Brand Logo */}
                  <div className="mb-10 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="relative flex items-center group">
                      <span className="logo-text text-3xl tracking-[0.05em] font-semibold text-foreground flex items-baseline">
                        Visual<span className="text-primary font-extrabold">Ad</span><span className="font-light opacity-80">Gen</span>
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-4 mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                      Welcome back.
                    </h1>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                      Enter your workspace to continue building.
                    </p>
                  </div>

                  {/* Action Area */}
                  <div className="w-full space-y-8">
                    <GoogleLoginButton />

                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                      <div className="h-px flex-1 bg-border/50" />
                      Secure Access
                      <div className="h-px flex-1 bg-border/50" />
                    </div>

                    <p className="text-xs text-muted-foreground/50 leading-relaxed max-w-[280px] mx-auto">
                      By signing in, you agree to our <br />
                      <span className="text-primary/60 hover:text-primary cursor-pointer underline underline-offset-4 decoration-primary/20 transition-all font-semibold">Terms</span> and <span className="text-primary/60 hover:text-primary cursor-pointer underline underline-offset-4 decoration-primary/20 transition-all font-semibold">Privacy Policy</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
};
