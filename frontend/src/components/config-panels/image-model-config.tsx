import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';
import { Cpu, Settings, ChevronDown } from 'lucide-react';

interface ImageModelConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    model?: string;
    parameters?: Record<string, unknown> & {
      guidance_scale?: number;
      num_inference_steps?: number;
      seed?: number;
    };
  };
}

type ImageModelParamKey = 'guidance_scale' | 'num_inference_steps' | 'seed';

export const ImageModelConfig = ({ nodeId, config }: ImageModelConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  const models = [
    { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell' },
    { id: 'fal-ai/flux/dev', name: 'FLUX Dev' },
    { id: 'fal-ai/stable-diffusion-xl', name: 'SDXL' },
  ];

  const parameters = config.parameters || {};

  const handleParamChange = (key: ImageModelParamKey, value: number | undefined) => {
    updateNode(nodeId, {
      config: {
        ...config,
        parameters: {
          ...parameters,
          [key]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Cpu className="h-3.5 w-3.5 text-primary/60" />
          <Label className="text-xs font-semibold text-foreground/80 lowercase first-letter:uppercase tracking-tight">Selected Model</Label>
        </div>
        <div className="relative group">
          <select
            className="flex h-10 w-full rounded-xl border border-border/80 dark:border-white/10 bg-muted/20 dark:bg-white/5 px-3 py-2 text-sm shadow-sm focus:border-primary/40 focus:bg-muted/30 outline-none appearance-none transition-all pr-10"
            value={config.model || 'fal-ai/flux/schnell'}
            onChange={(e) => updateNode(nodeId, { config: { ...config, model: e.target.value } })}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-card">{m.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-primary/60 transition-colors" />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="flex items-center gap-2 px-0.5 mb-2">
          <Settings className="h-3.5 w-3.5 text-primary/60" />
          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">Model Parameters</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Guidance Scale</Label>
            <Input
              type="number"
              step="0.1"
              className="bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 h-10 px-3 text-sm rounded-xl shadow-sm"
              value={parameters.guidance_scale ?? 7.5}
              onChange={(e) => handleParamChange('guidance_scale', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Steps</Label>
            <Input
              type="number"
              className="bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 h-10 px-3 text-sm rounded-xl shadow-sm"
              value={parameters.num_inference_steps ?? 20}
              onChange={(e) => handleParamChange('num_inference_steps', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Seed (Optional)</Label>
          <Input
            type="number"
            placeholder="Random"
            className="bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 h-10 px-3 text-sm rounded-xl shadow-sm"
            value={parameters.seed ?? ''}
            onChange={(e) => handleParamChange('seed', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>
    </div>
  );
};
