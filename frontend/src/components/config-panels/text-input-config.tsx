import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Type } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import type { CSSProperties } from 'react';
import type { NodeConfigProps, TextInputConfigData } from '@/types/workflow';

export const TextInputConfig = ({ nodeId, config }: NodeConfigProps<TextInputConfigData>) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.TEXT_INPUT.color;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Type className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="value" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">
            Input Content
          </Label>
        </div>
        <div className="relative group">
          <Squircle cornerRadius={16} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
            <Textarea
              id="value"
              value={config.value || ''}
              onChange={(e) => updateNode(nodeId, { config: { ...config, value: e.target.value } })}
              placeholder="Enter your content here..."
              className="min-h-[160px] bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all resize-none p-4 leading-relaxed text-sm font-medium w-full outline-none"
              style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
            />
          </Squircle>
          <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <Squircle cornerRadius={8} cornerSmoothing={1}>
              <span className="text-[10px] font-mono font-bold bg-background/50 backdrop-blur-xs px-2 py-1 border border-border/10" style={{ color: themeColor }}>
                {(config.value as string)?.length || 0} characters
              </span>
            </Squircle>
          </div>
        </div>
      </div>
    </div>
  );
};
