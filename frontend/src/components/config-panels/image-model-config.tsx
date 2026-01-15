import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';

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

export const ImageModelConfig = ({ nodeId, config }: ImageModelConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  const models = [
    { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell' },
    { id: 'fal-ai/flux/dev', name: 'FLUX Dev' },
    { id: 'fal-ai/stable-diffusion-xl', name: 'SDXL' },
  ];

  const parameters = config.parameters || {};

  const handleParamChange = (key: string, value: any) => {
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
      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Selected Model</Label>
        <select
          className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-1 text-sm shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary outline-none transition-all"
          value={config.model || 'fal-ai/flux/schnell'}
          onChange={(e) => updateNode(nodeId, { config: { ...config, model: e.target.value } })}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="bg-card">{m.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4 pt-2 border-t border-dashed border-border/40">
        <h4 className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Model Parameters</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Guidance Scale</Label>
            <Input
              type="number"
              step="0.1"
              className="bg-muted/20 border-border/40 h-8 text-xs"
              value={parameters.guidance_scale ?? 7.5}
              onChange={(e) => handleParamChange('guidance_scale', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Steps</Label>
            <Input
              type="number"
              className="bg-muted/20 border-border/40 h-8 text-xs"
              value={parameters.num_inference_steps ?? 20}
              onChange={(e) => handleParamChange('num_inference_steps', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Seed (Optional)</Label>
          <Input
            type="number"
            placeholder="Random"
            className="bg-muted/20 border-border/40 h-8 text-xs"
            value={parameters.seed ?? ''}
            onChange={(e) => handleParamChange('seed', e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
      </div>
    </div>
  );
};
