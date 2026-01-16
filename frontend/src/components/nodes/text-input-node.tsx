import { BaseNode } from './base-node';
import { Type } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

export const TextInputNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Text Input" icon={<Type className="h-4 w-4" />} {...props}>
        <div className="font-bold truncate" style={{ color: NODE_CONFIGS.TEXT_INPUT.color }}>
            {String(props.data.config?.value || 'Empty Input')}
        </div>
    </BaseNode>
);
