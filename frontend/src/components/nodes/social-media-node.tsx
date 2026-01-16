import { BaseNode } from './base-node';
import { Share2 } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

export const SocialMediaNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Social Media" icon={<Share2 className="h-4 w-4" />} {...props}>
        <div className="flex flex-col gap-0.5 text-[11px]">
            <div className="font-bold capitalize" style={{ color: NODE_CONFIGS.SOCIAL_MEDIA.color }}>
                {String(props.data.config?.platform || 'Reddit')}
            </div>
            <div className="text-muted-foreground font-mono opacity-80">r/{String(props.data.config?.subreddit || 'technology')}</div>
        </div>
    </BaseNode>
);
