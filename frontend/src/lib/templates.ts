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
    // Template 1: Luxury Beauty Ad (Linear: text -> social -> prompt -> model -> output)
    {
        name: 'Luxury Beauty',
        nodes: [
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Chanel No. 5 Perfume' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Beauty Trends', config: { subreddit: 'fragrance', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Luxury Writer', config: { template: 'Ultra high-end perfume advertisement for {{text}}. Golden hour lighting, marble surface, rose petals scattered. Inspired by "{{top_post}}" aesthetic for {{community_vibe}}. Vogue magazine style, 8k photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Schnell', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Campaign Shot', config: { aspect_ratio: '4:5', num_images: 1 } } }
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
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Sony WH-1000XM5 Headphones - Noise cancelling, 30hr battery, premium leather' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Tech Community', config: { subreddit: 'headphones', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Tech Copywriter', config: { template: 'Sleek product photography of {{text}}. Minimalist dark background with dramatic rim lighting. Community discussing: {{keywords}}. Apple-style advertisement for {{community_vibe}}. ultra sharp 8k.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Schnell', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Hero Image', config: { aspect_ratio: '1:1', num_images: 1 } } }
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
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product', config: { value: 'Organic Cold Brew Coffee' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Food Trends', config: { subreddit: 'coffee', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Food Stylist', config: { template: 'Artisanal food photography of {{text}}. Morning sunlight through window, rustic wooden table, coffee beans scattered. Trending topic: "{{top_post}}". Perfect for {{community_vibe}}. Instagram-worthy, shallow depth of field, warm tones.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'SDXL Lightning', config: { model: 'fal-ai/fast-lightning-sdxl' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Social Post', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 4: Fashion Editorial (Image-to-Image / Style Reference)
    {
        name: 'Fashion Editorial',
        nodes: [
            { id: 'image', type: 'IMAGE_INPUT', position: { x: 800, y: 120 }, data: { label: 'Style Reference', config: { image_url: 'https://ufowzipklwjkjguywapw.supabase.co/storage/v1/object/public/test/2.jpg' } } },
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Brand/Item', config: { value: "Woman's Oversized Wool Coat, Camel - Parisian chic, autumn vibes" } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Fashion Pulse', config: { subreddit: 'FemaleFashionAdvice', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Fashion Director', config: { template: 'High fashion editorial shot of {{text}}. Model walking on cobblestone street, golden hour, cinematic composition. Reference style from provided image. Current mood: {{keywords}}. Designed for {{community_vibe}}. Vogue Paris aesthetic, professional fashion photography.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'Nano Banana', config: { model: 'fal-ai/nano-banana' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Editorial', config: { aspect_ratio: '4:5', num_images: 1 } } }
        ],
        edges: [
            { source: 'image', target: 'model' },
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 5: Instagram Story Ad (Image-to-Image)
    {
        name: 'Story Ad',
        nodes: [
            { id: 'image', type: 'IMAGE_INPUT', position: { x: 800, y: 120 }, data: { label: 'Product Image', config: { image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80' } } },
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Product Name', config: { value: 'Glossier Cloud Paint Blush' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Beauty Community', config: { subreddit: 'makeupaddiction', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Social Creative', config: { template: 'Vertical Instagram story ad for {{text}}. Use the provided image as the main product. Pastel gradient background, soft shadows, Gen-Z aesthetic. Hot topic: "{{top_post}}". Made for {{community_vibe}}. Clean, minimal, swipe-up ready.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'FLUX Schnell', config: { model: 'fal-ai/flux/schnell' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Story Creative', config: { aspect_ratio: '9:16', num_images: 1 } } }
        ],
        edges: [
            { source: 'image', target: 'model' },
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 6: Gaming Gear (Image-to-Image)
    {
        name: 'Gaming Gear',
        nodes: [
            { id: 'image', type: 'IMAGE_INPUT', position: { x: 800, y: 120 }, data: { label: 'Setup Photo', config: { image_url: 'https://ufowzipklwjkjguywapw.supabase.co/storage/v1/object/public/test/3.jpg' } } },
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Peripheral', config: { value: 'RGB Mechanical Gaming Keyboard' } } },
            { id: 'social', type: 'SOCIAL_MEDIA', position: { x: 450, y: 350 }, data: { label: 'Gaming Trends', config: { subreddit: 'mechanicalkeyboards', limit: 10 } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 800, y: 350 }, data: { label: 'Gaming Creative', config: { template: 'Epic gaming setup hero shot showcasing {{text}}. Enhance the lighting and atmosphere based on the provided setup image with RGB reflections, dark ambient room, neon glow. Community obsessed with: {{keywords}}. Built for {{community_vibe}}. Razer/Corsair style advertisement, dramatic, powerful.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 1150, y: 350 }, data: { label: 'SDXL Lightning', config: { model: 'fal-ai/fast-lightning-sdxl' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1500, y: 350 }, data: { label: 'Product Shot', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'image', target: 'model' },
            { source: 'text', target: 'social' },
            { source: 'social', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    },
    // Template 7: Creative Remix (Image-to-Image)
    {
        name: 'Creative Remix',
        nodes: [
            { id: 'image', type: 'IMAGE_INPUT', position: { x: 450, y: 120 }, data: { label: 'Source Image', config: { image_url: 'https://ufowzipklwjkjguywapw.supabase.co/storage/v1/object/public/test/1.jpg' } } },
            { id: 'text', type: 'TEXT_INPUT', position: { x: 100, y: 350 }, data: { label: 'Style Preference', config: { value: 'Minimalist product photography, cyberpunk aesthetic, neon cyan and magenta accents' } } },
            { id: 'prompt', type: 'PROMPT', position: { x: 450, y: 350 }, data: { label: 'Remix Prompt', config: { template: 'A creative remix of the provided product image. Apply the following style: {{text}}. High quality, sharp detail, 8k resolution.' } } },
            { id: 'model', type: 'IMAGE_MODEL', position: { x: 800, y: 350 }, data: { label: 'Remix Engine', config: { model: 'fal-ai/fast-lightning-sdxl' } } },
            { id: 'output', type: 'OUTPUT', position: { x: 1150, y: 350 }, data: { label: 'Remixed Result', config: { aspect_ratio: '1:1', num_images: 1 } } }
        ],
        edges: [
            { source: 'image', target: 'model' },
            { source: 'text', target: 'prompt' },
            { source: 'prompt', target: 'model' },
            { source: 'model', target: 'output' }
        ]
    }
];

export const generateAIWorkflow = () => {
    const randomTemplate = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    return createTemplate(randomTemplate.nodes, randomTemplate.edges);
};
