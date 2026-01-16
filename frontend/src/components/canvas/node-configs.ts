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
  color: string;
}

export const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  TEXT_INPUT: { label: 'Text Input', icon: Type, color: '#6366f1' }, // Indigo
  IMAGE_INPUT: { label: 'Image Input', icon: ImageIcon, color: '#f59e0b' }, // Amber
  SOCIAL_MEDIA: { label: 'Social Media', icon: Share2, color: '#f43f5e' }, // Rose
  PROMPT: { label: 'Prompt Template', icon: PenTool, color: '#a855f7' }, // Purple
  IMAGE_MODEL: { label: 'Image Model', icon: Brain, color: '#10b981' }, // Emerald
  OUTPUT: { label: 'Output', icon: Download, color: '#94a3b8' }, // Slate
};
