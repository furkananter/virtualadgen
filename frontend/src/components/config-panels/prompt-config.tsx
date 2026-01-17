import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Lightbulb, Copy, Check, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { CSSProperties } from 'react';
import type { NodeConfigProps, PromptConfigData } from '@/types/workflow';

export const PromptConfig = ({ nodeId, config }: NodeConfigProps<PromptConfigData>) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.PROMPT.color;
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const variables = [
    { name: 'text', desc: 'Raw text input content' },
    { name: 'image_url', desc: 'Uploaded image URL' },
    { name: 'keywords', desc: 'Extracted topics from Reddit' },
    { name: 'community_vibe', desc: 'Description of the audience' },
    { name: 'top_post', desc: 'Most engaging post title' },
    { name: 'trends', desc: 'Trending keywords (legacy)' },
  ];

  const handleCopy = async (name: string) => {
    const text = `{{${name}}}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVar(name);
      toast.success(`Copied ${text} to clipboard`, {
        style: { background: themeColor, color: 'white', border: 'none' }
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopiedVar(null), 2000);
    } catch (err) {
      toast.error(`Failed to copy: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Terminal className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="template" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
            Prompt Template
          </Label>
        </div>
        <div className="relative group">
          <Squircle cornerRadius={16} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
            <Textarea
              id="template"
              value={config.template || ''}
              onChange={(e) => updateNode(nodeId, { config: { ...config, template: e.target.value } })}
              placeholder="Use {{trends}} or {{text}} to inject variables..."
              className="min-h-50 bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all resize-none p-5 font-mono text-sm leading-relaxed w-full outline-none"
              style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
            />
          </Squircle>
        </div>

        <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-xs">
          <div className={cn(
            "flex items-center justify-between p-4 border transition-all duration-300 w-full",
            config.ai_optimize !== false
              ? "bg-amber-500/20 border-border/80 dark:border-white/10 rounded-xl"
              : "bg-muted/30 dark:bg-white/5 border-border/80 dark:border-white/10 rounded-xl"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-optimize" className={cn(
                  "text-[11px] font-bold uppercase tracking-widest transition-colors",
                  config.ai_optimize !== false ? "text-amber-500" : "text-foreground/90"
                )}>AI Optimizer</Label>
                <Sparkles className={cn("h-3 w-3 transition-colors", config.ai_optimize !== false ? "text-amber-500/60" : "text-muted-foreground/40")} />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground/70 leading-tight">Refines prompt using AI for better results</p>
            </div>
            <Switch
              id="ai-optimize"
              checked={config.ai_optimize ?? true}
              onCheckedChange={(checked) => updateNode(nodeId, { config: { ...config, ai_optimize: checked } })}
              className="data-[state=checked]:bg-amber-500/20 shrink-0 transition-transform active:scale-95"
            />
          </div>
        </Squircle>

        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-3 w-3" style={{ color: themeColor }} />
              <h4 className="text-[11px] font-black uppercase tracking-widest" style={{ color: themeColor }}>Available Variables</h4>
            </div>
            <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">Click to copy</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {variables.map((v) => (
              <button
                key={v.name}
                onClick={() => handleCopy(v.name)}
                className="group/var flex items-center justify-between py-1.5 px-2 rounded-xl border border-transparent hover:bg-muted/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <code className="text-[10px] font-bold font-mono transition-colors" style={{ color: themeColor }}>
                    {`{{${v.name}}}`}
                  </code>
                  <span className="text-[10px] font-medium text-muted-foreground/60 group-hover/var:text-foreground/70 transition-colors">
                    {v.desc}
                  </span>
                </div>
                <div className="opacity-0 group-hover/var:opacity-100 transition-opacity">
                  {copiedVar === v.name ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground/40" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
