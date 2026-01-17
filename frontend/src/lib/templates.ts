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
            config: n.type === 'PROMPT'
                ? { ai_optimize: true, ...n.data.config }
                : (n.data.config ?? {}),
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
    // Template 1: Luxury Beauty Ad
    {
        name: 'Luxury Beauty',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Premium Fragrance' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Social Media', config: { subreddit: 'fragrance', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Prompt Template', config: { template: 'Ultra-high-end editorial photography of {{text}}. The aesthetic is heavily influenced by "{{community_vibe}}". Professional studio lighting with soft-box diffusion and dramatic rim light. Background features organic textures and hints of {{keywords}}. Shot on Phase One XF, 100MP, focused on intricate bottle details and liquid reflections.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Output', config: { aspect_ratio: '4:5', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 2: Tech Innovation Launch
    {
        name: 'Tech Innovation',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Next-Gen VR Headset' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Social Media', config: { subreddit: 'technology', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Prompt Template', config: { template: 'Cinematic hero shot of {{text}} in a futuristic, minimal lab setting. Dynamic blue and violet volumetric lighting. Top trending topic {{top_post}} should inspire the digital HUD elements in the background. Targeted at {{community_vibe}}. Hyper-realistic materials, carbon fiber and glass textures, shot on Sony A7R V, 8k.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Output', config: { aspect_ratio: '16:9', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 3: Street Lookbook
    {
        name: 'Street Lookbook',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Distressed Denim Jacket' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Social Media', config: { subreddit: 'streetwear', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Prompt Template', config: { template: 'Authentic street-style lookbook shot of {{text}}. Gritty urban Tokyo background with neon light reflections on wet pavement. Capturing the essence of {{community_vibe}}. Style inspired by {{keywords}}. Realistic film grain, shot on 35mm Leica M6, natural lighting, high fashion streetwear aesthetic.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Output', config: { aspect_ratio: '2:3', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 4: Editorial Fashion (Image-to-Image)
    {
        name: 'Editorial Remix',
        nodes: [
            { id: 'image', type: 'IMAGE_INPUT', position: { x: 800, y: 120 }, data: { label: 'Image Input', config: { image_url: 'https://ufowzipklwjkjguywapw.supabase.co/storage/v1/object/public/test/2.jpg' } } },
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'High-Fashion Summer Dress' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Social Media', config: { subreddit: 'fashion', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Prompt Template', config: { template: 'A high-end fashion editorial of {{text}}, strictly maintaining the lighting and color grade of the reference image. Scene context: {{community_vibe}}. Use {{keywords}} to add subtle background details. Masterpiece quality, cinematic composition, elite photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Engine', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Output', config: { aspect_ratio: '4:5', num_images: 1 } } }
        ],
        edges: [
            { source: 'image', target: 'model' },
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
