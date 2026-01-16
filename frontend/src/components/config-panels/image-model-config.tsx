import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';
import { Cpu, Settings, ChevronDown } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

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

// Models that don't support guidance_scale and num_inference_steps
const SIMPLE_PARAM_MODELS = [
  'fal-ai/gpt-image-1.5',
  'fal-ai/nano-banana',
];

export const ImageModelConfig = ({ nodeId, config }: ImageModelConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.IMAGE_MODEL.color;

  const models = [
    { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell' },
    { id: 'fal-ai/fast-lightning-sdxl', name: 'SDXL Lightning' },
    { id: 'fal-ai/gpt-image-1.5', name: 'GPT Image 1.5' },
    { id: 'fal-ai/nano-banana', name: 'Nano Banana' },
  ];

  const selectedModel = config.model || 'fal-ai/flux/schnell';
  const showAdvancedParams = !SIMPLE_PARAM_MODELS.includes(selectedModel);
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
          <Cpu className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Selected Model</Label>
        </div>
        <div className="relative group">
          <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
            <select
              className="flex h-11 w-full border-none bg-muted/30 dark:bg-white/5 px-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-offset-0 outline-none appearance-none transition-all pr-10 font-medium cursor-pointer"
              style={{ '--tw-ring-color': `${themeColor}66` } as any}
              value={selectedModel}
              onChange={(e) => updateNode(nodeId, { config: { ...config, model: e.target.value } })}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-card">{m.name}</option>
              ))}
            </select>
          </Squircle>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-foreground transition-colors" />
        </div>
      </div>

      {showAdvancedParams && (
        <div className="space-y-4 pt-6 border-t border-border/40">
          <div className="flex items-center gap-2 px-0.5 mb-2">
            <Settings className="h-3.5 w-3.5" style={{ color: themeColor }} />
            <h4 className="text-[10px] uppercase font-black tracking-widest text-foreground/70">Model Parameters</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">Guidance Scale</Label>
              <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                <Input
                  type="number"
                  step="0.1"
                  className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                  style={{ '--tw-ring-color': `${themeColor}66` } as any}
                  value={parameters.guidance_scale ?? 7.5}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    handleParamChange('guidance_scale', isNaN(v) ? undefined : v);
                  }}
                />
              </Squircle>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">Steps</Label>
              <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                <Input
                  type="number"
                  className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                  style={{ '--tw-ring-color': `${themeColor}66` } as any}
                  value={parameters.num_inference_steps ?? 20}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    handleParamChange('num_inference_steps', isNaN(v) ? undefined : v);
                  }}
                />
              </Squircle>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">Seed (Optional)</Label>
            <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
              <Input
                type="number"
                placeholder="Random"
                className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                style={{ '--tw-ring-color': `${themeColor}66` } as any}
                value={parameters.seed ?? ''}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  handleParamChange('seed', Number.isNaN(parsed) || e.target.value === '' ? undefined : parsed);
                }}
              />
            </Squircle>
          </div>
        </div>
      )}
    </div>
  );
};

