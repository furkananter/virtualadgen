import type { Node, Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

export const generateMagicTemplate = () => {
    const textNodeId = crypto.randomUUID();
    const socialNodeId = crypto.randomUUID();
    const promptNodeId = crypto.randomUUID();
    const modelNodeId = crypto.randomUUID();
    const outputNodeId = crypto.randomUUID();

    const nodes: Node<NodeData>[] = [
        {
            id: textNodeId,
            type: 'TEXT_INPUT',
            position: { x: 50, y: 100 },
            data: { label: 'Product Name', config: { value: 'Apple Vision Pro' } }
        },
        {
            id: socialNodeId,
            type: 'SOCIAL_MEDIA',
            position: { x: 50, y: 250 },
            data: { label: 'Reddit Trends', config: { subreddit: 'gaming', limit: 5 } }
        },
        {
            id: promptNodeId,
            type: 'PROMPT',
            position: { x: 350, y: 175 },
            data: { label: 'Ad Copywriter', config: { template: 'A futuristic product shot of {{text}} with holographic interfaces, inspired by latest trends in {{trends}}. Hyper-realistic photography, 8k, cinematic lighting.' } }
        },
        {
            id: modelNodeId,
            type: 'IMAGE_MODEL',
            position: { x: 750, y: 175 }, // Increased gap (was 650)
            data: { label: 'Pro Generator', config: { model: 'fal-ai/flux/schnell', parameters: { guidance_scale: 7.5, steps: 20 } } }
        },
        {
            id: outputNodeId,
            type: 'OUTPUT',
            position: { x: 1050, y: 175 }, // Increased gap (was 950)
            data: { label: 'Final Ad', config: { aspect_ratio: '1:1', num_images: 1 } }
        }
    ];

    const edges: Edge[] = [
        { id: crypto.randomUUID(), source: textNodeId, target: promptNodeId, sourceHandle: 'right', targetHandle: 'left' },
        { id: crypto.randomUUID(), source: socialNodeId, target: promptNodeId, sourceHandle: 'right', targetHandle: 'left' },
        { id: crypto.randomUUID(), source: promptNodeId, target: modelNodeId, sourceHandle: 'right', targetHandle: 'left' },
        { id: crypto.randomUUID(), source: modelNodeId, target: outputNodeId, sourceHandle: 'right', targetHandle: 'left' }
    ];

    return { nodes, edges };
};
