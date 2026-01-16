import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { Header } from '@/components/layout/header';
import { Squircle } from '@squircle-js/react';
import { ArrowRight, Zap, Image as ImageIcon, Sparkles, Wand2, Rocket, ShieldCheck, Play, MousePointer2, X } from 'lucide-react';

export const LandingPage = () => {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isIntroOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Small timeout to ensure modal is rendered
      const timer = setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          (focusableElements[0] as HTMLElement).focus();
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsIntroOpen(false);
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
        previousActiveElement.current?.focus();
      };
    }
  }, [isIntroOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-hidden font-sans transition-colors duration-300">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[12px] font-semibold mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary uppercase tracking-[0.2em]">Next Generation Creative Engine</span>
              </div>

              <h1 className="text-7xl md:text-[110px] font-bold tracking-tighter leading-[0.9] mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                Visualizing <br />
                <span className="text-muted-foreground/30">Creativity.</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-14 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed font-medium">
                The node-based workspace for high-performance ad generation.
                Build, automate, and scale your creative vision.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                <Link to="/login">
                  <Button size="lg" className="h-16 px-12 text-lg gap-3 font-bold rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Start Building <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-16 px-10 text-lg gap-3 font-semibold rounded-2xl hover:bg-muted/50"
                  onClick={() => setIsIntroOpen(true)}
                  aria-expanded={isIntroOpen}
                  aria-haspopup="dialog"
                  aria-controls="intro-video-modal"
                >
                  <Play className="h-5 w-5 fill-current" /> Watch Intro
                </Button>
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
                <Squircle cornerRadius={40} cornerSmoothing={1} className="relative aspect-square glass flex items-center justify-center border-white/10 group-hover:border-primary/20 duration-500 overflow-hidden">
                  <img
                    src="/abstract_node_gradient_ui.png"
                    alt="Process Visualization"
                    className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </Squircle>
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
            <div className="flex gap-10 text-sm text-muted-foreground font-semibold">
              <Link to="/platform" className="hover:text-foreground transition-colors">Platform</Link>
              <Link to="/api" className="hover:text-foreground transition-colors">API</Link>
              <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </PageContainer>
      </footer>

      {/* Intro Video Modal */}
      {isIntroOpen && (
        <div
          ref={modalRef}
          id="intro-video-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setIsIntroOpen(false)}
          />
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-10 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setIsIntroOpen(false)}
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-center p-8">
                <Play className="h-20 w-20 text-primary mx-auto mb-6 opacity-20" />
                <h3 className="text-2xl font-bold mb-2">Intro Video Placeholder</h3>
                <p className="text-muted-foreground">The platform demo will play here.</p>
              </div>
              {/* Actual video element could go here:
              <iframe
                src="https://www.youtube.com/embed/..."
                className="w-full h-full"
                allowFullScreen
              />
              */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureMetric = ({ title, value, label, icon }: { title: string; value: string; label: string; icon: React.ReactNode }) => (
  <Squircle cornerRadius={32} cornerSmoothing={1} className="p-8 border border-border/50 bg-card hover:border-primary/20 transition-all duration-500 group">
    <div className="flex items-center gap-3 mb-6 text-muted-foreground group-hover:text-primary transition-colors">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
    </div>
    <div className="text-5xl font-bold tracking-tighter mb-2">{value}</div>
    <div className="text-muted-foreground text-sm font-medium">{label}</div>
  </Squircle>
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

