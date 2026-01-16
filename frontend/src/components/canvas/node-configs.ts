import {
  Type,
  Image as ImageIcon,
  Share2,
  PenTool,
  Brain,
  Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NodeType } from '@/types/database';

export interface NodeConfig {
  label: string;
  icon: LucideIcon;
}

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  TEXT_INPUT: { label: 'Text Input', icon: Type },
  IMAGE_INPUT: { label: 'Image Input', icon: ImageIcon },
  SOCIAL_MEDIA: { label: 'Social Media', icon: Share2 },
  PROMPT: { label: 'Prompt Template', icon: PenTool },
  IMAGE_MODEL: { label: 'Image Model', icon: Brain },
  OUTPUT: { label: 'Output', icon: Download },
};
