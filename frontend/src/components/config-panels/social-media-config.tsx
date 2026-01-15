import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';

interface SocialMediaConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    subreddit?: string;
    limit?: number;
  };
}

export const SocialMediaConfig = ({ nodeId, config }: SocialMediaConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subreddit">Subreddit</Label>
        <Input
          id="subreddit"
          value={config.subreddit || 'technology'}
          onChange={(e) => updateNode(nodeId, { config: { ...config, subreddit: e.target.value } })}
          placeholder="e.g. technology"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="limit">Limit</Label>
        <Input
          id="limit"
          type="number"
          value={config.limit || 10}
          onChange={(e) => updateNode(nodeId, { config: { ...config, limit: parseInt(e.target.value) } })}
        />
      </div>
    </div>
  );
};
