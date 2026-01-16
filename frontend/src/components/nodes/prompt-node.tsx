import { BaseNode } from './base-node';
import { PenTool } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const PromptNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Prompt Template" icon={<PenTool className="h-4 w-4" />} {...props}>
        <div className="text-muted-foreground line-clamp-3 italic leading-relaxed">
            {String(props.data.config?.template || 'Build your prompt...')}
        </div>
    </BaseNode>
);
