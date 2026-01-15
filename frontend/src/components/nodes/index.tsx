import { BaseNode } from './base-node';
import { Type, Image as ImageIcon, Share2, PenTool, Brain, Download } from 'lucide-react';
import type { NodeProps } from 'reactflow';

export const TextInputNode = (props: NodeProps) => (
  <BaseNode title="Text Input" icon={<Type className="h-4 w-4" />} {...props}>
    <div className="text-muted-foreground italic whitespace-pre-wrap wrap-break-word line-clamp-4">
      {props.data.config?.value || 'Enter text...'}
    </div>
  </BaseNode>
);

export const ImageInputNode = (props: NodeProps) => (
  <BaseNode title="Image Input" icon={<ImageIcon className="h-4 w-4" />} {...props}>
    <div className="flex flex-col gap-1">
      {props.data.config?.image_url ? (
        <img src={props.data.config.image_url} alt="Input" className="h-20 w-full object-cover rounded" />
      ) : (
        <div className="h-20 w-full bg-muted rounded flex items-center justify-center text-muted-foreground">
          No image
        </div>
      )}
    </div>
  </BaseNode>
);

export const SocialMediaNode = (props: NodeProps) => (
  <BaseNode title="Social Media" icon={<Share2 className="h-4 w-4" />} {...props}>
    <div className="flex flex-col gap-1">
      <div className="font-medium capitalize">{props.data.config?.platform || 'Reddit'}</div>
      <div className="text-muted-foreground">r/{props.data.config?.subreddit || 'technology'}</div>
    </div>
  </BaseNode>
);

export const PromptNode = (props: NodeProps) => (
  <BaseNode title="Prompt Template" icon={<PenTool className="h-4 w-4" />} {...props}>
    <div className="text-muted-foreground line-clamp-3">
      {props.data.config?.template || 'Build your prompt...'}
    </div>
  </BaseNode>
);

export const ImageModelNode = (props: NodeProps) => (
  <BaseNode title="Image Model" icon={<Brain className="h-4 w-4" />} {...props}>
    <div className="flex flex-col gap-1">
      <div className="font-medium truncate">{props.data.config?.model?.split('/').pop() || 'FLUX Schnell'}</div>
      <div className="text-muted-foreground italic">FAL AI</div>
    </div>
  </BaseNode>
);

export const OutputNode = (props: NodeProps) => (
  <BaseNode title="Output" icon={<Download className="h-4 w-4" />} {...props}>
    <div className="text-muted-foreground">
      {props.data.config?.aspect_ratio || '1:1'} • {props.data.config?.num_images || 1} images
    </div>
  </BaseNode>
);
