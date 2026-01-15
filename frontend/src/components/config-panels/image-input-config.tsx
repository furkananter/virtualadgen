import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';

interface ImageInputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    image_url?: string;
  };
}

export const ImageInputConfig = ({ nodeId, config }: ImageInputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          value={config.image_url || ''}
          onChange={(e) => updateNode(nodeId, { config: { ...config, image_url: e.target.value } })}
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
};
