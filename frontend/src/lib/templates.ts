import type { Node, Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

type TemplateNode = Omit<Node<NodeData>, 'id' | 'selected' | 'data'> & {
    id: string;
    data: Omit<NodeData, 'config'> & { config?: Record<string, unknown> };
};
type TemplateEdge = Pick<Edge, 'source' | 'target' | 'sourceHandle' | 'targetHandle'>;

const createTemplate = (nodesData: TemplateNode[], edgesData: TemplateEdge[]) => {
    const idMap: Record<string, string> = {};

    // First, map all conceptual IDs to real UUIDs
    nodesData.forEach(n => {
        idMap[n.id] = crypto.randomUUID();
    });

    const nodes: Node<NodeData>[] = nodesData.map(n => ({
        ...n,
        id: idMap[n.id],
        selected: false,
        data: {
            ...n.data,
            config: n.data.config ?? {},
        },
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
            { id: 'text', type: 'TEXT_INPUT', position: { x: 50, y: 100 }, data: { label: 'Specs', config: { value: 'Minimalist Coffee Machine, Matte Black' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 50, y: 250 }, data: { label: 'Market Trends', config: { subreddit: 'coffee', limit: 3 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 350, y: 175 }, data: { label: 'Ecom Writer', config: { template: 'Commercial product photography of {{text}}. Style influence from {{trends}}. Daylight, 8k, bokeh background.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 750, y: 175 }, data: { label: 'Premium GPU', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1050, y: 175 }, data: { label: 'Store Listing' } }
        ],
        edges: [
            { source: 'text', target: 'prompt' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 3: Creative Concept Art
    {
        name: 'Cyberpunk Vision',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 50, y: 80 }, data: { label: 'Concept', config: { value: 'Electric Sneakers' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 50, y: 220 }, data: { label: 'Urban Trends', config: { subreddit: 'cyberpunk', limit: 3 } } },
            { id: 'img', type: 'IMAGE_INPUT', position: { x: 50, y: 360 }, data: { label: 'Inspiration', config: { image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f' } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 380, y: 220 }, data: { label: 'Style Mapper', config: { template: 'Cyberpunk 2077 style ad for {{text}} with {{trends}} vibes, neon lights, raining city background, tech-wear aesthetic.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 750, y: 220 }, data: { label: 'Creative Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1050, y: 220 }, data: { label: 'Final Concept' } }
        ],
        edges: [
            { source: 'text', target: 'prompt' },
            { source: 'social', target: 'prompt' },
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
