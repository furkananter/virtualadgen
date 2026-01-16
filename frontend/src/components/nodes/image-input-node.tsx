import { BaseNode } from './base-node';
import { Image as ImageIcon, Upload } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import { useCanvasStore } from '@/stores/canvas-store';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ImageInputNode = (props: NodeProps<NodeData>) => {
    const updateNode = useCanvasStore((state) => state.updateNode);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please drop an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            updateNode(props.id, { config: { ...props.data.config, image_url: base64 } });
            toast.success('Image updated');
        };
        reader.readAsDataURL(file);
    }, [props.id, props.data.config, updateNode]);

    return (
        <BaseNode title="Image Input" icon={<ImageIcon className="h-4 w-4" />} {...props}>
            <div
                className={cn(
                    "flex flex-col gap-1 transition-all duration-200",
                    isDragging && "scale-[1.02] brightness-110"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {props.data.config?.image_url ? (
                    <div className="relative group overflow-hidden rounded-[20px]">
                        <img
                            src={props.data.config.image_url as string}
                            alt="Input"
                            className="h-24 w-full object-cover shadow-inner"
                            referrerPolicy="no-referrer"
                        />
                        {isDragging && (
                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                                <Upload className="h-8 w-8 text-white animate-bounce" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className={cn(
                            "h-20 w-full rounded-[20px] flex flex-col items-center justify-center text-[10px] font-black tracking-widest border-2 border-dashed transition-all",
                            isDragging
                                ? "bg-primary/10 border-primary scale-[1.05]"
                                : "bg-muted/40 border-border/50"
                        )}
                        style={{ color: isDragging ? undefined : NODE_CONFIGS.IMAGE_INPUT.color }}
                    >
                        <Upload className={cn("h-5 w-5 mb-1", isDragging ? "text-primary animate-bounce" : "opacity-40")} />
                        {isDragging ? 'DROP TO UPLOAD' : 'DROP IMAGE'}
                    </div>
                )}
            </div>
        </BaseNode>
    );
};
