import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { Header } from '@/components/layout/header';
import { Squircle } from '@squircle-js/react';
import { ArrowRight, Zap, Image as ImageIcon, Sparkles, Wand2, Rocket, ShieldCheck } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1 relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,var(--primary),transparent_70%)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary opacity-[0.02] blur-[120px] rounded-full animate-slow-rotate pointer-events-none" />

        <div className="bg-grid absolute inset-0 pointer-events-none text-foreground" />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <PageContainer className="relative z-10 text-center">
            <Squircle cornerRadius={100} cornerSmoothing={1} className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted/50 border border-border/50 text-[13px] font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Next Gen Creative Workflow</span>
            </Squircle>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Transform Ideas into <br />
              <span className="text-muted-foreground/40">Visual Excellence</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed">
              The first node-based engine for high-scale ad generation. Build complex pipelines
              connecting social trends, AI research, and cinematic production models.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link to="/login">
                <Button size="lg" className="h-14 px-10 text-lg gap-2 font-bold shadow-2xl shadow-primary/20">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg backdrop-blur-sm bg-background/50 border-border">
                Watch Demo
              </Button>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-24 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 max-w-5xl mx-auto px-4">
              <div className="absolute inset-0 bg-primary opacity-[0.05] blur-[100px] -z-10 transform scale-75" />
              <Squircle cornerRadius={40} cornerSmoothing={1} className="glass p-2 shadow-2xl relative overflow-hidden group border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
                  alt="Interface Preview"
                  className="w-full h-auto grayscale-[0.2] opacity-90 border border-border/50 shadow-2xl transition-all duration-700 group-hover:scale-[1.01] group-hover:grayscale-0 group-hover:opacity-100 dark:grayscale-[0.5] dark:opacity-80 rounded-[32px]"
                />

                {/* Floating Node Elements */}
                <div className="absolute top-1/4 -left-12 animate-float shadow-2xl z-20 hidden lg:block">
                  <Squircle cornerRadius={20} cornerSmoothing={1} className="glass p-4 flex items-center gap-3 border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Source</div>
                      <div className="text-sm font-bold">Reddit API</div>
                    </div>
                  </Squircle>
                </div>

                <div className="absolute bottom-1/4 -right-12 animate-float shadow-2xl z-20 hidden lg:block" style={{ animationDelay: '2s' }}>
                  <Squircle cornerRadius={20} cornerSmoothing={1} className="glass p-4 flex items-center gap-3 border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Model</div>
                      <div className="text-sm font-bold">Flux.1 Pro</div>
                    </div>
                  </Squircle>
                </div>
              </Squircle>
            </div>
          </PageContainer>
        </section>

        {/* Features Grid */}
        <section className="py-32 relative">
          <PageContainer>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wand2 className="h-5 w-5" />}
                title="Node Editor"
                description="Visual interface for creative logic. Connect data and models like building blocks."
              />
              <FeatureCard
                icon={<Rocket className="h-5 w-5" />}
                title="Hyper-Speed"
                description="Built on elite inference engines. Premium results in under 8 seconds."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Scalable"
                description="Enterprise-grade production for modern brands and agencies."
              />
            </div>
          </PageContainer>
        </section>

        {/* Call to Action */}
        <section className="py-32 relative">
          <PageContainer className="text-center">
            <Squircle cornerRadius={80} cornerSmoothing={1} className="max-w-4xl mx-auto glass p-12 md:p-20 relative overflow-hidden border-white/10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 tracking-tight">Redefine Your Creative <br />Power.</h2>
              <Link to="/login" className="relative z-10">
                <Button size="lg" className="h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/20">
                  Start Building Now
                </Button>
              </Link>
            </Squircle>
          </PageContainer>
        </section>
      </main>

      <footer className="border-t border-border py-16 bg-muted/30">
        <PageContainer>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
              <span className="text-primary italic">V</span>VisualAdGen
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-medium">
              <span className="hover:text-foreground transition-colors cursor-pointer">Product</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Pricing</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
            </div>
          </div>
          <div className="text-muted-foreground/20 text-[10px] tracking-[0.2em] uppercase font-bold text-center md:text-left">
            © 2026 VisualAdGen. Crafted with precision.
          </div>
        </PageContainer>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Squircle cornerRadius={32} cornerSmoothing={1} className="group relative p-8 border border-border bg-card hover:bg-muted/50 transition-all duration-500">
    <Squircle cornerRadius={12} cornerSmoothing={1} className="h-10 w-10 bg-muted flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
      {icon}
    </Squircle>
    <h3 className="text-[18px] font-bold mb-3 tracking-tight">{title}</h3>
    <p className="text-muted-foreground text-[15px] leading-relaxed transition-all duration-500">
      {description}
    </p>
  </Squircle>
);
