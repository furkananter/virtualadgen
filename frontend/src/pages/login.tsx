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

        {/* Global Dot Pattern */}
        <div className="bg-dot absolute inset-0 pointer-events-none" />

        <PageContainer className="relative z-10 w-full max-w-[460px]">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            <div className="relative bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[48px] overflow-hidden">
              <div className="p-10 md:pt-12 md:px-12 md:pb-10 relative z-10">
                <div className="flex flex-col items-center text-center">
                  {/* Brand Logo */}
                  <div className="mb-6 relative flex flex-col items-center">
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 blur-2xl rounded-full" />
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500/20 blur-2xl rounded-full" />
                    <span className="logo-text text-3xl tracking-[0.05em] font-semibold text-foreground flex items-baseline">
                      Visual<span className="text-primary font-black">Ad</span><span className="font-light opacity-60">Gen</span>
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2 mb-8">
                    <h1 className="text-[32px] md:text-3xl font-black tracking-tight text-foreground leading-tight">
                      Welcome back.
                    </h1>
                    <p className="text-muted-foreground/80 text-sm md:text-base leading-relaxed font-medium px-4">
                      Enter your workspace to continue building.
                    </p>
                  </div>

                  {/* Action Area */}
                  <div className="w-full space-y-6">
                    <GoogleLoginButton />

                    <div className="flex items-center gap-6">
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/50 to-transparent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 whitespace-nowrap">
                        Secure Access
                      </span>
                      <div className="h-px flex-1 bg-linear-to-r from-transparent via-border/50 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detached Footer */}
            <div className="mt-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300 fill-mode-both">
              <div className="flex flex-col items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/20">
                <span className="opacity-60">By signing in, you agree to our</span>
                <div className="flex items-center gap-4 text-muted-foreground/40">
                  <button className="hover:text-primary transition-all hover:underline underline-offset-8 decoration-primary/40">Terms</button>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <button className="hover:text-primary transition-all hover:underline underline-offset-8 decoration-primary/40">Privacy Policy</button>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
};
