import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Type } from 'lucide-react';

interface TextInputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    value?: string;
  };
}

export const TextInputConfig = ({ nodeId, config }: TextInputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Type className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="value" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            Text Value
          </Label>
        </div>
        <div className="relative group">
          <Textarea
            id="value"
            value={config.value || ''}
            onChange={(e) => updateNode(nodeId, { config: { ...config, value: e.target.value } })}
            placeholder="Type your content here..."
            className="min-h-[160px] bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 transition-all rounded-[20px] resize-none p-4 leading-relaxed text-sm"
          />
          <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[10px] font-mono text-muted-foreground/40 font-medium">{(config.value as string)?.length || 0} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};
