import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { Squircle } from '@squircle-js/react';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />
        <div className="bg-grid absolute inset-0 text-foreground pointer-events-none" />

        <PageContainer className="relative z-10">
          <Card className="w-full max-w-md mx-auto p-0! border-none shadow-none bg-transparent">
            <Squircle cornerRadius={40} cornerSmoothing={1} className="glass border-border bg-card/50 shadow-2xl p-6 md:p-8">
              <CardHeader className="text-center pb-8 p-0">
                <Squircle cornerRadius={16} cornerSmoothing={1} className="mx-auto w-12 h-12 bg-muted flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-primary" />
                </Squircle>
                <CardTitle className="text-3xl font-bold tracking-tight mb-2">Welcome back</CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Sign in to your account to continue building your ad workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-0">
                <GoogleLoginButton />

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em]">
                    <span className="bg-background/50 backdrop-blur-sm px-4 text-muted-foreground rounded-full border border-border">Secure Access</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-center text-xs text-muted-foreground flex justify-center pb-0 p-0">
                <p className="max-w-[280px] leading-relaxed">
                  By continuing, you agree to our <span className="text-foreground font-medium hover:underline transition-colors cursor-pointer">Terms</span> and <span className="text-foreground font-medium hover:underline transition-colors cursor-pointer">Privacy</span>.
                </p>
              </CardFooter>
            </Squircle>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
};
