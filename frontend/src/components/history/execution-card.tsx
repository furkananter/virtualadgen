import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Cpu, Image, Type, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ExecutionStatus } from './execution-status';
import { ExecutionGallery } from './execution-gallery';
import type { ExecutionWithRelations } from '@/lib/supabase/executions';

const MODEL_NAMES: Record<string, string> = {
    'fal-ai/flux/schnell': 'FLUX Schnell',
    'fal-ai/flux/schnell/redux': 'FLUX Redux',
    'fal-ai/fast-lightning-sdxl': 'SDXL Lightning',
    'fal-ai/fast-lightning-sdxl/image-to-image': 'SDXL Lightning Edit',
    'fal-ai/nano-banana': 'Nano Banana',
    'fal-ai/nano-banana/edit': 'Nano Banana Edit',
};

const extractWorkflowInputs = (execution: ExecutionWithRelations) => {
    const inputs: any[] = [];
    for (const ne of execution.node_executions) {
        const out: any = ne.output_data;
        if (!out) continue;
        const type = ne.node_type || 'TEXT_INPUT';
        if (type === 'TEXT_INPUT' && out.text) inputs.push({ type: 'text', label: ne.node_name || 'Text', value: out.text });
        else if (type === 'IMAGE_INPUT' && out.image_url) inputs.push({ type: 'image', label: ne.node_name || 'Image', value: out.image_url });
        else if (type === 'SOCIAL_MEDIA' && out.trends) {
            const val = Array.isArray(out.trends) ? out.trends.join(', ') : out.trends;
            inputs.push({ type: 'social', label: ne.node_name || 'Trends', value: val });
        }
    }
    return inputs;
};

export const ExecutionCard = ({ execution }: { execution: ExecutionWithRelations }) => {
    const imageUrls = execution.generations?.flatMap(g => g.image_urls ?? []) ?? [];
    const gen = execution.generations?.[0];
    const inputs = extractWorkflowInputs(execution);

    return (
        <Card className="overflow-hidden border-border bg-card hover:bg-card/90 transition-all duration-300">
            <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono opacity-40">#{execution.id.slice(0, 6)}</span>
                    <div className="flex items-center gap-1 text-[12px] font-bold">
                        <Calendar className="h-3 w-3 opacity-50" />
                        {format(new Date(execution.started_at), 'MMM d, HH:mm')}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {execution.total_cost && <span className="text-[10px] font-mono text-primary font-bold">${execution.total_cost.toFixed(4)}</span>}
                    <ExecutionStatus status={execution.status} />
                </div>
            </CardHeader>

            <div className="px-4 pb-3 space-y-3">
                {inputs.length > 0 && (
                    <div className="grid gap-1.5">
                        {inputs.map((input, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                                {input.type === 'text' && <Type className="h-3 w-3 text-blue-400" />}
                                {input.type === 'image' && <Image className="h-3 w-3 text-purple-400" />}
                                {input.type === 'social' && <TrendingUp className="h-3 w-3 text-orange-400" />}
                                <span className="font-bold opacity-50 truncate">{input.label}:</span>
                                {input.type === 'image' ? <a href={input.value} target="_blank" rel="noopener noreferrer" className="text-primary truncate">View</a> : <span className="truncate flex-1">{input.value}</span>}
                            </div>
                        ))}
                    </div>
                )}

                {gen && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold">
                            <Cpu className="h-3 w-3 opacity-50" />
                            {MODEL_NAMES[gen.model_id] ?? gen.model_id?.split('/').pop() ?? 'Unknown model'}
                            {gen.aspect_ratio && <span className="opacity-50">• {gen.aspect_ratio}</span>}
                        </div>
                        {gen.prompt && (
                            <p className="text-[10px] text-muted-foreground line-clamp-2 italic opacity-80">"{gen.prompt}"</p>
                        )}
                    </div>
                )}
            </div>

            <CardContent className="p-4 pt-0">
                <ExecutionGallery imageUrls={imageUrls} />
            </CardContent>
        </Card>
    );
};
