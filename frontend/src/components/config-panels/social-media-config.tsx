import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Hash, List, SortAsc, ChevronDown } from 'lucide-react';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import type { CSSProperties } from 'react';
import type { NodeConfigProps, SocialMediaConfigData } from '@/types/workflow';

export const SocialMediaConfig = ({ nodeId, config }: NodeConfigProps<SocialMediaConfigData>) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.SOCIAL_MEDIA.color;

  const sortOptions = [
    { id: 'hot', name: 'Hot' },
    { id: 'new', name: 'New' },
    { id: 'top', name: 'Top' },
    { id: 'rising', name: 'Rising' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Hash className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="subreddit" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Subreddit</Label>
        </div>
        <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
          <Input
            id="subreddit"
            value={config.subreddit || 'technology'}
            onChange={(e) => updateNode(nodeId, { config: { ...config, subreddit: e.target.value } })}
            placeholder="e.g. technology"
            className="border-none h-11 px-4 bg-muted/30 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-offset-0 font-medium transition-all w-full outline-none"
            style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
          />
        </Squircle>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <SortAsc className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="sort" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Sort Order</Label>
        </div>
        <div className="relative group">
          <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
            <select
              id="sort"
              className="flex h-11 w-full border-none bg-muted/30 dark:bg-white/5 px-4 py-2 text-sm outline-none appearance-none transition-all pr-10 font-medium cursor-pointer focus-visible:ring-1 focus-visible:ring-offset-0"
              style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
              value={config.sort || 'hot'}
              onChange={(e) => updateNode(nodeId, { config: { ...config, sort: e.target.value as SocialMediaConfigData['sort'] } })}
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-card">{opt.name}</option>
              ))}
            </select>
          </Squircle>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none group-focus-within:text-foreground transition-colors" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <List className="h-3.5 w-3.5" style={{ color: themeColor }} />
          <Label htmlFor="limit" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Post Limit</Label>
        </div>
        <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
          <Input
            id="limit"
            type="number"
            min={1}
            max={100}
            value={config.limit || 10}
            onChange={(e) => updateNode(nodeId, { config: { ...config, limit: parseInt(e.target.value) || 1 } })}
            className="border-none h-11 px-4 bg-muted/30 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-offset-0 font-medium transition-all w-full outline-none"
            style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
          />
        </Squircle>
      </div>
    </div>
  );
};
