import { useCanvasStore } from '@/stores/canvas-store';
import { TextInputConfig } from './text-input-config';
import { ImageInputConfig } from './image-input-config';
import { SocialMediaConfig } from './social-media-config';
import { PromptConfig } from './prompt-config';
import { ImageModelConfig } from './image-model-config';
import { OutputConfig } from './output-config';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const ConfigPanel = () => {
  const { nodes, selectedNodeId, updateNode } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center h-full">
        <div className="mb-4 opacity-20">
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        Select a node to configure its properties
      </div>
    );
  }

  const renderConfig = () => {
    const props = { nodeId: selectedNode.id, config: selectedNode.data.config || {} };
    switch (selectedNode.type) {
      case 'TEXT_INPUT': return <TextInputConfig {...props} />;
      case 'IMAGE_INPUT': return <ImageInputConfig {...props} />;
      case 'SOCIAL_MEDIA': return <SocialMediaConfig {...props} />;
      case 'PROMPT': return <PromptConfig {...props} />;
      case 'IMAGE_MODEL': return <ImageModelConfig {...props} />;
      case 'OUTPUT': return <OutputConfig {...props} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            Configuration
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-mono">
              {selectedNode.id}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="node-name">Node Name</Label>
            <Input
              id="node-name"
              value={selectedNode.data.label || ''}
              onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 py-2 border-y border-dashed">
            <div className="space-y-0.5">
              <Label htmlFor="breakpoint">Breakpoint</Label>
              <p className="text-[10px] text-muted-foreground">Pause execution here</p>
            </div>
            {/* Simple checkbox if Switch not yet created */}
            <input
              type="checkbox"
              id="breakpoint"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={selectedNode.data.has_breakpoint || false}
              onChange={(e) => updateNode(selectedNode.id, { has_breakpoint: e.target.checked })}
            />
          </div>

          <div className="pt-2">
            {renderConfig()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
