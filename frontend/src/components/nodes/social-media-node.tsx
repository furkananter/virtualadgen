import { BaseNode } from './base-node';
import { Share2 } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const SocialMediaNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Social Media" icon={<Share2 className="h-4 w-4" />} {...props}>
        <div className="flex flex-col gap-1 text-[11px]">
            <div className="font-bold capitalize">{String(props.data.config?.platform || 'Reddit')}</div>
            <div className="text-muted-foreground font-mono">r/{String(props.data.config?.subreddit || 'technology')}</div>
        </div>
    </BaseNode>
);
