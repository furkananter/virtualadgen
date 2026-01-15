import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';

interface ImageModelConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    model?: string;
  };
}

export const ImageModelConfig = ({ nodeId, config }: ImageModelConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  const models = [
    { id: 'fal-ai/flux/schnell', name: 'FLUX Schnell' },
    { id: 'fal-ai/flux/dev', name: 'FLUX Dev' },
    { id: 'fal-ai/stable-diffusion-xl', name: 'SDXL' },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Model</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary outline-none"
          value={config.model || 'fal-ai/flux/schnell'}
          onChange={(e) => updateNode(nodeId, { config: { ...config, model: e.target.value } })}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} className="bg-card">{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
