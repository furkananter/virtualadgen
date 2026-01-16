import type { Node, Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

const createTemplate = (nodesData: any[], edgesData: any[]) => {
    const idMap: Record<string, string> = {};

    // First, map all conceptual IDs to real UUIDs
    nodesData.forEach(n => {
        idMap[n.id] = crypto.randomUUID();
    });

    const nodes: Node<NodeData>[] = nodesData.map(n => ({
        ...n,
        id: idMap[n.id],
        selected: false,
    }));

    const edges: Edge[] = edgesData.map(e => ({
        ...e,
        id: crypto.randomUUID(),
        source: idMap[e.source],
        target: idMap[e.target],
    }));

    return { nodes, edges };
};

const TEMPLATES = [
    // Template 1: Social Media Viral Ad (The Original)
    {
        name: 'Social Trends Ad',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 50, y: 100 }, data: { label: 'Product', config: { value: 'Dyson Airwrap' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 50, y: 250 }, data: { label: 'TikTok Trends', config: { subreddit: 'skincare', limit: 3 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 350, y: 175 }, data: { label: 'Viral Prompt', config: { template: 'A cinematic high-end ad for {{text}}, style inspired by {{trends}} aesthetic. Soft luxury lighting, studio photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 750, y: 175 }, data: { label: 'Flux Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1050, y: 175 }, data: { label: 'Final Ad' } }
        ],
        edges: [
            { source: 'text', target: 'prompt' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 2: Professional E-commerce Product
    {
        name: 'Pro E-commerce',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 50, y: 150 }, data: { label: 'Specs', config: { value: 'Minimalist Coffee Machine, Matte Black' } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 350, y: 150 }, data: { label: 'Ecom Writer', config: { template: 'Commercial product photography of {{text}} on a kitchen counter, daylight, 8k, bokeh background.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 650, y: 150 }, data: { label: 'Premium GPU', config: { model: 'fal-ai/flux/pro' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 950, y: 150 }, data: { label: 'Store Listing' } }
        ],
        edges: [
            { source: 'text', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 3: Creative Concept Art
    {
        name: 'Cyberpunk Vision',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 50, y: 100 }, data: { label: 'Concept', config: { value: 'Electric Sneakers' } } },
            { id: 'img', type: 'IMAGE_INPUT', position: { x: 50, y: 280 }, data: { label: 'Inspiration', config: { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f' } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 380, y: 190 }, data: { label: 'Style Mapper', config: { template: 'Cyberpunk 2077 style ad for {{text}}, neon lights, raining city background, tech-wear aesthetic.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 700, y: 190 }, data: { label: 'Creative Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1000, y: 190 }, data: { label: 'Final Concept' } }
        ],
        edges: [
            { source: 'text', target: 'prompt' },
            { source: 'img', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    }
];

export const generateMagicTemplate = () => {
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    return createTemplate(randomTemplate.nodes, randomTemplate.edges);
};
