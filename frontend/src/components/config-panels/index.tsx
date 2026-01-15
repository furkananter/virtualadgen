import { useState } from 'react';
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
import { X, Settings2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeInspector } from '@/components/debug/node-inspector';
import { cn } from '@/lib/utils';

type TabType = 'config' | 'inspector';

export const ConfigPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const { nodes, selectedNodeId, updateNode, setSelectedNodeId } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

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
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-3xl">
      <Card className="h-full rounded-none border-0 shadow-none bg-transparent flex flex-col">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              {selectedNode.data.label || 'Node'}
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono uppercase">
                {selectedNode.type}
              </span>
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => setSelectedNodeId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Custom Tabs */}
        <div className="flex px-4 pt-4 shrink-0">
          <div className="flex p-1 bg-muted/40 rounded-xl w-full">
            <button
              onClick={() => setActiveTab('config')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg",
                activeTab === 'config' ? "bg-card text-foreground shadow-sm" : "hover:bg-card/50 text-muted-foreground"
              )}
            >
              <Settings2 className="h-3 w-3" /> Config
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-lg",
                activeTab === 'inspector' ? "bg-card text-foreground shadow-sm" : "hover:bg-card/50 text-muted-foreground"
              )}
            >
              <Terminal className="h-3 w-3" /> Inspector
            </button>
          </div>
        </div>

        <CardContent className="p-4 flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="node-name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Node Name</Label>
                <Input
                  id="node-name"
                  className="bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 py-3 border-y border-dashed border-border/40">
                <div className="space-y-0.5">
                  <Label htmlFor="breakpoint" className="text-xs font-bold">Breakpoint</Label>
                  <p className="text-[10px] text-muted-foreground">Pause execution here</p>
                </div>
                <input
                  type="checkbox"
                  id="breakpoint"
                  className="h-4 w-4 rounded border-border bg-muted cursor-pointer accent-primary"
                  checked={selectedNode.data.has_breakpoint || false}
                  onChange={(e) => updateNode(selectedNode.id, { has_breakpoint: e.target.checked })}
                />
              </div>

              <div className="pt-2">
                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-4">Properties</h3>
                  {renderConfig()}
                </div>
              </div>
            </div>
          ) : (
            <NodeInspector nodeId={selectedNode.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
