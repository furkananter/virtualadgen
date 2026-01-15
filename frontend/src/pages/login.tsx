import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { useAuthStore } from '@/stores/auth-store';
import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/shared/loading-screen';

export const LoginPage = () => {
  const { user, isLoading } = useAuthStore();

  if (user && !isLoading) {
    return <Navigate to="/workflows" replace />;
  }

  if (isLoading) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 selection:bg-primary/20">
      <Header />
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-1000" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <PageContainer className="relative z-10 w-full max-w-lg">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Squircle cornerRadius={48} cornerSmoothing={1} className="relative bg-card/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-2xl ring-1 ring-black/5">
              <div className="p-8 md:p-12">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Icon */}
                  <Squircle cornerRadius={20} cornerSmoothing={1} className="w-16 h-16 bg-primary/10 flex items-center justify-center shadow-inner">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </Squircle>

                  {/* Header Text */}
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                      Welcome back
                    </h1>
                    <p className="text-muted-foreground text-base max-w-[280px] mx-auto leading-relaxed">
                      Sign in to access your creative studio and manage your ad workflows.
                    </p>
                  </div>

                  {/* Login Area */}
                  <div className="w-full space-y-6 pt-2">
                    <GoogleLoginButton />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                        <span className="bg-background/20 backdrop-blur-md px-4 text-muted-foreground/60">
                          Secure Access
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground/60 max-w-[260px] mx-auto leading-relaxed">
                      By continuing, you accept our <span className="hover:text-primary cursor-pointer transition-colors font-medium">Terms of Service</span> and <span className="hover:text-primary cursor-pointer transition-colors font-medium">Privacy Policy</span>.
                    </p>
                  </div>
                </div>
              </div>
            </Squircle>
          </div>
        </PageContainer>
      </main>
    </div>
  );
};
