import { BaseNode } from './base-node';
import { Download, ExternalLink } from 'lucide-react';
import type { NodeProps } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const OutputNode = (props: NodeProps<NodeData>) => {
    const executionData = props.data.execution_data as { final_images?: string[] } | null | undefined;
    const finalImages = executionData?.final_images;

    return (
        <BaseNode title="Output" icon={<Download className="h-4 w-4" />} {...props}>
            <div className="flex flex-col gap-3">
                {finalImages && finalImages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {finalImages.map((url, i) => (
                            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                                <img src={url} alt={`Generation ${i}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3 text-white" />
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-muted-foreground text-center py-4 border border-dashed border-border/40 rounded-xl bg-muted/5">
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Ready for results</div>
                        <div className="text-[9px] mt-1 italic">{String(props.data.config?.aspect_ratio || '1:1')} • {Number(props.data.config?.num_images || 1)} images</div>
                    </div>
                )}
            </div>
        </BaseNode>
    );
};
