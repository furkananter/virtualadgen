import { BaseNode } from './base-node';
import { Brain } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

export const ImageModelNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Image Model" icon={<Brain className="h-4 w-4" />} {...props}>
        <div className="flex flex-col gap-1">
            <div className="font-bold truncate" style={{ color: NODE_CONFIGS.IMAGE_MODEL.color }}>
                {String(props.data.config?.model || 'FLUX SCHNELL').split('/').pop()?.toUpperCase()}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                FAL AI ENGINE
            </div>
        </div>
    </BaseNode>
);
