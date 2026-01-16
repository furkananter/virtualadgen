import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Hash, List } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Hash className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="subreddit" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Subreddit</Label>
        </div>
        <Input
          id="subreddit"
          value={config.subreddit || 'technology'}
          onChange={(e) => updateNode(nodeId, { config: { ...config, subreddit: e.target.value } })}
          placeholder="e.g. technology"
          className="rounded-[20px] h-10 px-4 bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <List className="h-3.5 w-3.5 text-primary/60" />
          <Label htmlFor="limit" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Limit</Label>
        </div>
        <Input
          id="limit"
          type="number"
          value={config.limit || 10}
          onChange={(e) => updateNode(nodeId, { config: { ...config, limit: parseInt(e.target.value) } })}
          className="rounded-[20px] h-10 px-4 bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10"
        />
      </div>
    </div>
  );
};
