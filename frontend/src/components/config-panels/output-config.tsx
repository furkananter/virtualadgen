import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';
import { Maximize2, Layers, ChevronDown } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

interface OutputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    aspect_ratio?: string;
    num_images?: number;
  };
}

export const OutputConfig = ({ nodeId, config }: OutputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.OUTPUT.color;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Maximize2 className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="aspect_ratio" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Aspect Ratio</Label>
        </div>
        <div className="relative group">
          <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
            <select
              id="aspect_ratio"
              className="flex h-11 w-full border-none bg-muted/30 dark:bg-white/5 px-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-offset-0 outline-none appearance-none transition-all pr-10 font-medium cursor-pointer"
              style={{ '--tw-ring-color': `${themeColor}66` } as any}
              value={config?.aspect_ratio || '1:1'}
              onChange={(e) => updateNode(nodeId, { config: { ...config, aspect_ratio: e.target.value } })}
            >
              <option value="1:1" className="bg-card">1:1 Square</option>
              <option value="4:5" className="bg-card">4:5 Portrait</option>
              <option value="9:16" className="bg-card">9:16 Story</option>
            </select>
          </Squircle>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-foreground transition-colors" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Layers className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="num_images" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Number of Images</Label>
        </div>
        <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
          <Input
            id="num_images"
            type="number"
            min={1}
            max={4}
            className="border-none h-11 px-4 bg-muted/30 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-offset-0 font-medium transition-all w-full outline-none"
            style={{ '--tw-ring-color': `${themeColor}66` } as any}
            value={config?.num_images || 1}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              const value = Number.isNaN(parsed) ? 1 : Math.min(4, Math.max(1, parsed));
              updateNode(nodeId, { config: { ...config, num_images: value } });
            }}
          />
        </Squircle>
      </div>
    </div>
  );
};
