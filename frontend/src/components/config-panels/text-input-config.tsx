import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';

interface TextInputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    value?: string;
  };
}

export const TextInputConfig = ({ nodeId, config }: TextInputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="value">Text Value</Label>
        <Textarea
          id="value"
          value={config.value || ''}
          onChange={(e) => updateNode(nodeId, { config: { ...config, value: e.target.value } })}
          placeholder="Enter the text to use..."
          className="min-h-32"
        />
      </div>
    </div>
  );
};
