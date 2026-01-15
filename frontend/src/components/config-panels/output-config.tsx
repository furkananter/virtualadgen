import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCanvasStore } from '@/stores/canvas-store';

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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Aspect Ratio</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary outline-none"
          value={config.aspect_ratio || '1:1'}
          onChange={(e) => updateNode(nodeId, { config: { ...config, aspect_ratio: e.target.value } })}
        >
          <option value="1:1" className="bg-card">1:1 Square</option>
          <option value="4:5" className="bg-card">4:5 Portrait</option>
          <option value="9:16" className="bg-card">9:16 Story</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="num_images">Number of Images</Label>
        <Input
          id="num_images"
          type="number"
          min={1}
          max={4}
          value={config.num_images || 1}
          onChange={(e) => updateNode(nodeId, { config: { ...config, num_images: parseInt(e.target.value) } })}
        />
      </div>
    </div>
  );
};
