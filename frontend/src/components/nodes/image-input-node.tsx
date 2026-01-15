import { BaseNode } from './base-node';
import { Image as ImageIcon } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const ImageInputNode = (props: NodeProps<NodeData>) => (
    <BaseNode title="Image Input" icon={<ImageIcon className="h-4 w-4" />} {...props}>
        <div className="flex flex-col gap-1">
            {props.data.config?.image_url ? (
                <img src={props.data.config.image_url as string} alt="Input" className="sx-squircle h-20 w-full object-cover rounded" referrerPolicy="no-referrer" />
            ) : (
                <div className="h-20 w-full bg-muted rounded flex items-center justify-center text-muted-foreground">
                    No image
                </div>
            )}
        </div>
    </BaseNode>
);
