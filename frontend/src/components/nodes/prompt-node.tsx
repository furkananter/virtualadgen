import { BaseNode } from './base-node';
import { PenTool } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';

export const PromptNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Prompt Template" icon={<PenTool className="h-4 w-4" />} {...props}>
        <div className="text-muted-foreground line-clamp-4 italic leading-relaxed text-[11px] font-medium" style={{ borderLeft: `2px solid ${NODE_CONFIGS.PROMPT.color}`, paddingLeft: '8px' }}>
            {String(props.data.config?.template || 'Build your prompt template...')}
        </div>
    </BaseNode>
);
