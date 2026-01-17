import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';
import { Cpu, Settings, ChevronDown } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import type { CSSProperties } from 'react';
import type { NodeConfigProps, ImageModelConfigData, ImageModelParameters } from '@/types/workflow';

type ImageModelParamKey = keyof ImageModelParameters;

// Model configurations with supported parameters
const MODEL_CONFIGS = {
  'fal-ai/flux/schnell': {
    name: 'FLUX Schnell',
    supportsGuidance: true,
    supportsSteps: true,
    stepsRange: { min: 1, max: 12, default: 4 },
    guidanceRange: { min: 1, max: 20, default: 3.5 },
  },
  'fal-ai/fast-lightning-sdxl': {
    name: 'SDXL Lightning',
    supportsGuidance: false,
    supportsSteps: true,
    stepsOptions: [1, 2, 4, 8], // Enum options
    stepsDefault: 4,
  },
  'fal-ai/nano-banana': {
    name: 'Nano Banana',
    supportsGuidance: false,
    supportsSteps: false,
  },
} as const;

type ModelId = keyof typeof MODEL_CONFIGS;

export const ImageModelConfig = ({ nodeId, config }: NodeConfigProps<ImageModelConfigData>) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.IMAGE_MODEL.color;

  const models = Object.entries(MODEL_CONFIGS).map(([id, cfg]) => ({
    id,
    name: cfg.name,
  }));

  const selectedModel = (config.model || 'fal-ai/flux/schnell') as ModelId;
  const modelConfig = MODEL_CONFIGS[selectedModel] || MODEL_CONFIGS['fal-ai/flux/schnell'];
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

  // Check if any parameter is supported for this model
  const hasAnyParams = modelConfig.supportsGuidance || modelConfig.supportsSteps;

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
              style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
              value={selectedModel}
              onChange={(e) => updateNode(nodeId, { config: { ...config, model: e.target.value } })}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-card">
                  {m.name}
                </option>
              ))}
            </select>
          </Squircle>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-foreground transition-colors" />
        </div>
      </div>

      {/* Model Parameters - Always show section, conditionally show each param */}
      <div className="space-y-4 pt-6 border-t border-border/40">
        <div className="flex items-center gap-2 px-0.5 mb-2">
          <Settings className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <h4 className="text-[10px] uppercase font-black tracking-widest text-foreground/70">Model Parameters</h4>
        </div>

        {hasAnyParams ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* Guidance Scale - Only for FLUX */}
              {modelConfig.supportsGuidance && 'guidanceRange' in modelConfig && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pl-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80">
                      CFG Scale
                    </Label>
                    <span className="text-[9px] text-muted-foreground/40">{modelConfig.guidanceRange.min}-{modelConfig.guidanceRange.max}</span>
                  </div>
                  <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                    <Input
                      type="number"
                      step="0.5"
                      min={modelConfig.guidanceRange.min}
                      max={modelConfig.guidanceRange.max}
                      className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                      style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
                      value={parameters.guidance_scale ?? modelConfig.guidanceRange.default}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        handleParamChange('guidance_scale', isNaN(v) ? undefined : v);
                      }}
                    />
                  </Squircle>
                </div>
              )}

              {/* Steps - Different UI based on model */}
              {modelConfig.supportsSteps && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">
                    Steps
                  </Label>
                  <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                    {'stepsOptions' in modelConfig ? (
                      // SDXL Lightning - Dropdown with fixed options
                      <div className="relative">
                        <select
                          className="flex h-11 w-full border-none bg-muted/30 dark:bg-white/5 px-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-offset-0 outline-none appearance-none transition-all pr-10 font-medium cursor-pointer"
                          style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
                          value={parameters.num_inference_steps ?? modelConfig.stepsDefault}
                          onChange={(e) => handleParamChange('num_inference_steps', parseInt(e.target.value, 10))}
                        >
                          {modelConfig.stepsOptions.map((step) => (
                            <option key={step} value={step} className="bg-card">
                              {step} steps
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
                      </div>
                    ) : 'stepsRange' in modelConfig ? (
                      // FLUX - Number input with range
                      <Input
                        type="number"
                        min={modelConfig.stepsRange.min}
                        max={modelConfig.stepsRange.max}
                        className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                        style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
                        value={parameters.num_inference_steps ?? modelConfig.stepsRange.default}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          handleParamChange('num_inference_steps', isNaN(v) ? undefined : v);
                        }}
                      />
                    ) : null}
                  </Squircle>
                </div>
              )}
            </div>

            {/* Seed - Always available */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">Seed (Optional)</Label>
              <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                <Input
                  type="number"
                  placeholder="Random"
                  className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                  style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
                  value={parameters.seed ?? ''}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    handleParamChange('seed', Number.isNaN(parsed) || e.target.value === '' ? undefined : parsed);
                  }}
                />
              </Squircle>
            </div>
          </>
        ) : (
          // Nano Banana - Only seed
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/80 pl-1">Seed (Optional)</Label>
            <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
              <Input
                type="number"
                placeholder="Random"
                className="bg-muted/30 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
                value={parameters.seed ?? ''}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  handleParamChange('seed', Number.isNaN(parsed) || e.target.value === '' ? undefined : parsed);
                }}
              />
            </Squircle>
            <p className="text-[9px] text-muted-foreground/50 italic pl-1">This model uses AI-optimized settings</p>
          </div>
        )}
      </div>
    </div>
  );
};

