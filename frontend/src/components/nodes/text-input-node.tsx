import { BaseNode } from './base-node';
import { Type } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const TextInputNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Text Input" icon={<Type className="h-4 w-4" />} {...props}>
        <div className="text-muted-foreground italic whitespace-pre-wrap wrap-break-word line-clamp-4">
            {String(props.data.config?.value || 'Enter text...')}
        </div>
    </BaseNode>
);
