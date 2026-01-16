import { useState } from 'react';
import { useCanvasStore } from '@/stores/canvas-store';
import { TextInputConfig } from './text-input-config';
import { ImageInputConfig } from './image-input-config';
import { SocialMediaConfig } from './social-media-config';
import { PromptConfig } from './prompt-config';
import { ImageModelConfig } from './image-model-config';
import { OutputConfig } from './output-config';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Settings2, Terminal, Hash, Fingerprint, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeInspector } from '@/components/debug/node-inspector';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

type TabType = 'config' | 'inspector';

export const ConfigPanel = () => {
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const { nodes, selectedNodeId, updateNode, setSelectedNodeId, deleteNode } = useCanvasStore();
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
    <div className="h-full flex flex-col bg-card/40 backdrop-blur-xl border-l border-border/50 shadow-2xl">
      <div className="flex flex-col h-full bg-linear-to-b from-transparent to-muted/10">
        <header className="p-5 border-b border-border/40 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Badge className="h-5 px-1.5 text-[9px] bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider">
                {selectedNode.type}
              </Badge>
              <h2 className="text-sm font-bold tracking-tight text-foreground/90">
                {selectedNode.data.label || 'Configure Node'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
              <Fingerprint className="h-3 w-3" />
              <span className="font-mono">ID: {selectedNode.id.substring(0, 8)}...</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted/80 transition-all active:scale-95"
            onClick={() => setSelectedNodeId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Navigation Tabs */}
        <nav className="p-4 shrink-0">
          <div className="flex p-1 bg-muted/30 border border-border/40 rounded-xl w-full">
            <button
              onClick={() => setActiveTab('config')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-lg",
                activeTab === 'config'
                  ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)] scale-[1.02]"
                  : "hover:bg-background/40 text-muted-foreground/60"
              )}
            >
              <Settings2 className={cn("h-3.5 w-3.5 transition-colors", activeTab === 'config' ? "text-primary" : "text-muted-foreground/40")} />
              Config
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-lg",
                activeTab === 'inspector'
                  ? "bg-background text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.1)] scale-[1.02]"
                  : "hover:bg-background/40 text-muted-foreground/60"
              )}
            >
              <Terminal className={cn("h-3.5 w-3.5 transition-colors", activeTab === 'inspector' ? "text-primary" : "text-muted-foreground/40")} />
              Inspector
            </button>
          </div>
        </nav>

        <section className="px-4 pb-4 flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'config' ? (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 px-0.5 mt-2">
                  <Hash className="h-3 w-3 text-muted-foreground/50" />
                  <Label htmlFor="node-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Node Name</Label>
                </div>
                <Input
                  id="node-name"
                  className="bg-muted/20 border-border/80 dark:border-white/10 dark:bg-white/5 focus:bg-muted/30 focus:border-primary/40 transition-all rounded-lg h-10 px-3 text-sm shadow-sm"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/5 rounded-xl border border-border/80 dark:border-white/10 group hover:border-primary/20 transition-colors shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="breakpoint" className="text-xs font-semibold">Breakpoint</Label>
                    <Info className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">Pause execution at this node</p>
                </div>
                <Switch
                  id="breakpoint"
                  checked={selectedNode.data.has_breakpoint || false}
                  onCheckedChange={(checked) => updateNode(selectedNode.id, { has_breakpoint: checked })}
                />
              </div>

              <Button
                variant="outline"
                className="w-full h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 transition-all"
                onClick={() => {
                  deleteNode(selectedNode.id);
                  setSelectedNodeId(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Node
              </Button>

              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-4">
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Properties</h3>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  {renderConfig()}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in scale-in-95 duration-300">
              <NodeInspector nodeId={selectedNode.id} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
