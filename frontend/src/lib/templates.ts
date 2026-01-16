import type { Node, Edge } from 'reactflow';
import type { NodeData } from '@/types/nodes';

type TemplateNode = Omit<Node<NodeData>, 'id' | 'selected' | 'data'> & {
    id: string;
    data: Omit<NodeData, 'config'> & { config?: Record<string, unknown> };
};
type TemplateEdge = Pick<Edge, 'source' | 'target' | 'sourceHandle' | 'targetHandle'>;

const createTemplate = (nodesData: TemplateNode[], edgesData: TemplateEdge[]) => {
    const idMap: Record<string, string> = {};

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
    // Template 1: Luxury Beauty Ad (Linear: text -> social -> prompt -> model -> output)
    {
        name: 'Luxury Beauty',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Product', config: { value: 'Chanel No. 5 Perfume' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Beauty Trends', config: { subreddit: 'fragrance', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Luxury Writer', config: { template: 'Ultra high-end perfume advertisement for {{text}}. Golden hour lighting, marble surface, rose petals scattered. Inspired by "{{top_post}}" aesthetic for {{community_vibe}}. Vogue magazine style, 8k photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX Pro', config: { model: 'fal-ai/flux/dev', parameters: { guidance_scale: 7.5, num_inference_steps: 28 } } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Campaign Shot', config: { aspect_ratio: '4:5', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 2: Tech Gadget Launch (Linear)
    {
        name: 'Tech Launch',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Product', config: { value: 'Sony WH-1000XM5 Headphones - Noise cancelling, 30hr battery, premium leather' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Tech Community', config: { subreddit: 'headphones', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Tech Copywriter', config: { template: 'Sleek product photography of {{text}}. Minimalist dark background with dramatic rim lighting. Community discussing: {{keywords}}. Apple-style advertisement for {{community_vibe}}, ultra sharp 8k.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX Schnell', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Hero Image', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 3: Food & Beverage (Linear)
    {
        name: 'Artisan Food',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Product', config: { value: 'Organic Cold Brew Coffee' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Food Trends', config: { subreddit: 'coffee', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Food Stylist', config: { template: 'Artisanal food photography of {{text}}. Morning sunlight through window, rustic wooden table, coffee beans scattered. Trending topic: "{{top_post}}". Perfect for {{community_vibe}}. Instagram-worthy, shallow depth of field, warm tones.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX Dev', config: { model: 'fal-ai/flux/dev', parameters: { guidance_scale: 7.5, num_inference_steps: 28 } } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Social Post', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 4: Fashion Editorial (Linear)
    {
        name: 'Fashion Editorial',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Brand/Item', config: { value: 'Oversized Wool Coat, Camel - Parisian chic, autumn vibes' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Fashion Pulse', config: { subreddit: 'malefashionadvice', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Fashion Director', config: { template: 'High fashion editorial shot of {{text}}. Model walking on cobblestone street, golden hour, cinematic composition. Current mood: {{keywords}}. Designed for {{community_vibe}}. Vogue Paris aesthetic, professional fashion photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX Dev', config: { model: 'fal-ai/flux/dev', parameters: { guidance_scale: 7, num_inference_steps: 25 } } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Editorial', config: { aspect_ratio: '4:5', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 5: Instagram Story Ad (Linear)
    {
        name: 'Story Ad',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Product', config: { value: 'Glossier Cloud Paint Blush' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Beauty Community', config: { subreddit: 'makeupaddiction', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Social Creative', config: { template: 'Vertical Instagram story ad for {{text}}. Pastel gradient background, floating product, soft shadows, Gen-Z aesthetic. Hot topic: "{{top_post}}". Made for {{community_vibe}}. Clean, minimal, swipe-up ready.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX Fast', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Story Creative', config: { aspect_ratio: '9:16', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 6: Gaming Peripheral (Linear)
    {
        name: 'Gaming Gear',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 300 }, data: { label: 'Product', config: { value: 'RGB Mechanical Gaming Keyboard' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 500, y: 300 }, data: { label: 'Gaming Trends', config: { subreddit: 'mechanicalkeyboards', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 900, y: 300 }, data: { label: 'Gaming Creative', config: { template: 'Epic gaming setup hero shot featuring {{text}}. RGB lighting reflections, dark ambient room, neon glow. Community obsessed with: {{keywords}}. Built for {{community_vibe}}. Razer/Corsair style advertisement, dramatic, powerful.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1300, y: 300 }, data: { label: 'FLUX', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1700, y: 300 }, data: { label: 'Product Shot', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    }
];

export const generateAIWorkflow = () => {
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    return createTemplate(randomTemplate.nodes, randomTemplate.edges);
};
