import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';
import { Maximize2, Layers, ChevronDown } from 'lucide-react';

interface OutputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    aspect_ratio?: string;
    num_images?: number;
  };
}

export const OutputConfig = ({ nodeId, config }: OutputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Maximize2 className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="aspect_ratio" className="text-xs font-semibold text-foreground/80 lowercase first-letter:uppercase tracking-tight">Aspect Ratio</Label>
        </div>
        <div className="relative group">
          <select
            id="aspect_ratio"
            className="flex h-10 w-full rounded-xl border border-border/80 dark:border-white/10 bg-muted/20 dark:bg-white/5 px-3 py-2 text-sm shadow-sm focus:border-primary/40 focus:bg-muted/30 outline-none appearance-none transition-all pr-10"
            value={config.aspect_ratio || '1:1'}
            onChange={(e) => updateNode(nodeId, { config: { ...config, aspect_ratio: e.target.value } })}
          >
            <option value="1:1" className="bg-card">1:1 Square</option>
            <option value="4:5" className="bg-card">4:5 Portrait</option>
            <option value="9:16" className="bg-card">9:16 Story</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-primary/60 transition-colors" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Layers className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="num_images" className="text-xs font-semibold text-foreground/80 lowercase first-letter:uppercase tracking-tight">Number of Images</Label>
        </div>
        <Input
          id="num_images"
          type="number"
          min={1}
          max={4}
          className="bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 transition-all rounded-xl h-10 px-3 text-sm shadow-sm"
          value={config.num_images || 1}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            const value = Number.isNaN(parsed) ? 1 : Math.min(4, Math.max(1, parsed));
            updateNode(nodeId, { config: { ...config, num_images: value } });
          }}
        />
      </div>
    </div>
  );
};
