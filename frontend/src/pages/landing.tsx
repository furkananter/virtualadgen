import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { Header } from '@/components/layout/header';
import { ArrowRight, Zap, Image as ImageIcon, Sparkles, Wand2, Rocket, ShieldCheck, MousePointer2 } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden font-sans">
      <Header />

      <main className="flex-1 relative">
        {/* Modern Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(circle_at_center,var(--primary),transparent_70%)] opacity-[0.05] dark:opacity-[0.1]" />
          <div className="bg-grid absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" />
        </div>

        {/* Hero Section */}
        <section className="relative pt-40 pb-32">
          <PageContainer className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[12px] font-semibold mb-10 animate-blur-reveal opacity-0">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary uppercase tracking-[0.2em]">Next Generation Creative Engine</span>
              </div>

              <h1 className="text-7xl md:text-[110px] font-bold tracking-tighter leading-[0.9] mb-10 animate-blur-reveal opacity-0 [animation-delay:200ms]">
                Visualizing <br />
                <span className="text-muted-foreground/30">Creativity.</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-14 animate-blur-reveal opacity-0 [animation-delay:400ms] leading-relaxed font-medium">
                The node-based workspace for high-performance ad generation.
                Build, automate, and scale your creative vision.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-blur-reveal opacity-0 [animation-delay:600ms]">
                <Link to="/login">
                  <Button size="lg" className="h-16 px-20 text-lg gap-3 font-bold rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start Building <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Simplified Feature Visual */}
            <div className="mt-40 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <div className="absolute inset-0 bg-primary opacity-[0.08] blur-[120px] -z-10" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <FeatureMetric
                  title="Speed"
                  value="8.2s"
                  label="Avg. Generation"
                  icon={<Zap className="h-5 w-5" />}
                />
                <FeatureMetric
                  title="Scale"
                  value="10k+"
                  label="Ads/Month"
                  icon={<Rocket className="h-5 w-5" />}
                />
                <FeatureMetric
                  title="Models"
                  value="14"
                  label="Elite Engines"
                  icon={<Wand2 className="h-5 w-5" />}
                />
              </div>
            </div>
          </PageContainer>
        </section>

        {/* The Workflow Advantage */}
        <section className="py-40 bg-muted/30 relative">
          <PageContainer>
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl font-bold tracking-tight mb-8">Node-based logic for <br />infinite control.</h2>
                <div className="space-y-8">
                  <WorkflowStep
                    icon={<MousePointer2 className="h-5 w-5" />}
                    title="Drag & Drop Interface"
                    description="Connect APIs, prompt templates, and image models in a unified visual canvas."
                  />
                  <WorkflowStep
                    icon={<ImageIcon className="h-5 w-5" />}
                    title="Dynamic Assets"
                    description="Transform raw data into cinematic advertisements with Flux and Stable Diffusion."
                  />
                  <WorkflowStep
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Enterprise Reliability"
                    description="Built for agencies requiring high-volume throughput and consistent quality."
                  />
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative aspect-square glass flex items-center justify-center border-white/10 group-hover:border-primary/20 duration-500 overflow-hidden rounded-[2.5rem]">
                  <img
                    src="/abstract_node_gradient_ui.png"
                    alt="Process Visualization"
                    className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* CTA Section */}
        <section className="py-40">
          <PageContainer className="text-center">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-12">Built for the future. <br /><span className="text-muted-foreground/40 text-glow">Available today.</span></h2>
            <Link to="/login">
              <Button size="lg" className="h-20 px-16 text-2xl gap-3 font-extrabold rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95">
                Join the Beta <ArrowRight className="h-8 w-8" />
              </Button>
            </Link>
          </PageContainer>
        </section>
      </main>

      <footer className="border-t border-border/50 py-20">
        <PageContainer>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center group">
              <span className="logo-text text-2xl tracking-[0.05em] font-semibold text-foreground flex items-baseline">
                Visual<span className="text-primary font-extrabold">Ad</span><span className="font-light opacity-80">Gen</span>
              </span>
            </div>
            <div className="flex gap-10 text-sm text-muted-foreground font-semibold items-center">
              <Link to="/platform" className="hover:text-foreground transition-colors">Platform</Link>
              <Link to="/api" className="hover:text-foreground transition-colors">API</Link>
              <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <div className="w-px h-4 bg-border/50 hidden md:block" />
              <ThemeToggle />
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
};

const FeatureMetric = ({ title, value, label, icon }: { title: string; value: string; label: string; icon: React.ReactNode }) => (
  <div className="p-8 border border-border/50 bg-card hover:border-primary/20 transition-all duration-500 group rounded-[2rem]">
    <div className="flex items-center gap-3 mb-6 text-muted-foreground group-hover:text-primary transition-colors">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </div>
    <div className="text-5xl font-bold tracking-tighter mb-2">{value}</div>
    <div className="text-muted-foreground text-sm font-medium">{label}</div>
  </div>
);

const WorkflowStep = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-6 group">
    <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

