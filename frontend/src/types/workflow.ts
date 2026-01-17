
export interface BaseNodeConfig {
    nodeId: string;
}

export interface TextInputConfigData {
    value?: string;
}

export interface ImageInputConfigData {
    image_url?: string;
}

export interface SocialMediaConfigData {
    subreddit?: string;
    limit?: number;
    sort?: 'hot' | 'new' | 'top' | 'rising';
}

export interface PromptConfigData {
    template?: string;
    ai_optimize?: boolean;
}

export interface ImageModelParameters {
    guidance_scale?: number;
    num_inference_steps?: number;
    seed?: number;
}

export interface ImageModelConfigData {
    model?: string;
    parameters?: ImageModelParameters;
}

export interface OutputConfigData {
    num_images?: number;
    aspect_ratio?: '1:1' | '4:5' | '9:16';
}

export interface NodeConfigProps<T> extends BaseNodeConfig {
    config: T;
}
