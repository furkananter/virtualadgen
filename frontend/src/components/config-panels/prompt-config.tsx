import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Lightbulb } from 'lucide-react';

interface PromptConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    template?: string;
  };
}

export const PromptConfig = ({ nodeId, config }: PromptConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Terminal className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="template" className="text-xs font-semibold text-foreground/80 lowercase first-letter:uppercase tracking-tight">
            Prompt Template
          </Label>
        </div>
        <div className="relative group">
          <Textarea
            id="template"
            value={config.template || ''}
            onChange={(e) => updateNode(nodeId, { config: { ...config, template: e.target.value } })}
            placeholder="Use {{trends}} or {{text}} to inject variables..."
            className="min-h-[180px] bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 transition-all rounded-xl resize-none p-4 font-mono text-sm leading-relaxed shadow-inner"
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] font-mono text-muted-foreground/40 font-medium">TEMPLATE</span>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">Available Variables</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['text', 'image_url', 'trends', 'posts'].map(v => (
                <code key={v} className="text-[9px] bg-primary/10 text-primary px-1 rounded uppercase font-bold">
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
