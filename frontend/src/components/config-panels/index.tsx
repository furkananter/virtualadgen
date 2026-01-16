import { Squircle } from '@squircle-js/react';
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
import { NODE_CONFIGS } from '@/components/canvas/node-configs';


export const ConfigPanel = () => {
  const {
    nodes,
    selectedNodeId,
    updateNode,
    setSelectedNodeId,
    deleteNode,
    configPanelTab: activeTab,
    setConfigPanelTab: setActiveTab
  } = useCanvasStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const nodeType = selectedNode.type as keyof typeof NODE_CONFIGS;
  const themeColor = NODE_CONFIGS[nodeType]?.color || '#6366f1';

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
    <div className="h-full flex flex-col bg-card/60 backdrop-blur-3xl border-l border-border/40">
      <div className="flex flex-col h-full bg-linear-to-b from-transparent to-muted/10">
        <header className="p-5 border-b border-border/40 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Squircle cornerRadius={6} cornerSmoothing={1}>
                <Badge
                  className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider border-none text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {selectedNode.type}
                </Badge>
              </Squircle>
              <h2 className="text-sm font-bold tracking-tight text-foreground/90 font-outfit">
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
            className="h-8 w-8 rounded-xl hover:bg-muted/80 transition-all active:scale-95"
            onClick={() => setSelectedNodeId(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Navigation Tabs */}
        <nav className="p-4 shrink-0">
          <Squircle cornerRadius={16} cornerSmoothing={1} className="overflow-hidden border border-border/40">
            <div role="tablist" className="p-1 bg-muted/40 w-full flex relative h-11">
              <button
                id="config-tab"
                role="tab"
                aria-selected={activeTab === 'config'}
                aria-controls="config-panel"
                onClick={() => setActiveTab('config')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 relative z-10",
                  activeTab === 'config' ? "" : "hover:bg-background/40 text-muted-foreground/60"
                )}
              >
                {activeTab === 'config' && (
                  <Squircle cornerRadius={12} cornerSmoothing={1} className="absolute inset-0 bg-background dark:bg-white/10 shadow-xs" />
                )}
                <Settings2 className="h-3.5 w-3.5 transition-colors relative z-10" style={activeTab === 'config' ? { color: themeColor } : {}} />
                <span className="relative z-10" style={activeTab === 'config' ? { color: themeColor } : {}}>Config</span>
              </button>
              <button
                id="inspector-tab"
                role="tab"
                aria-selected={activeTab === 'inspector'}
                aria-controls="inspector-panel"
                onClick={() => setActiveTab('inspector')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 relative z-10",
                  activeTab === 'inspector' ? "" : "hover:bg-background/40 text-muted-foreground/60"
                )}
              >
                {activeTab === 'inspector' && (
                  <Squircle cornerRadius={12} cornerSmoothing={1} className="absolute inset-0 bg-background dark:bg-white/10 shadow-xs" />
                )}
                <Terminal className="h-3.5 w-3.5 transition-colors relative z-10" style={activeTab === 'inspector' ? { color: themeColor } : {}} />
                <span className="relative z-10" style={activeTab === 'inspector' ? { color: themeColor } : {}}>Inspector</span>
              </button>
            </div>
          </Squircle>
        </nav>

        <section className="px-4 pb-4 flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'config' ? (
            <div id="config-panel" role="tabpanel" aria-labelledby="config-tab" className="flex flex-col min-h-full py-2">
              <div className="flex-1 space-y-6">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 px-0.5 mt-2">
                    <Hash className="h-3 w-3" style={{ color: themeColor }} />
                    <Label htmlFor="node-name" className="text-[11px] font-black uppercase tracking-widest text-foreground/90">Node Name</Label>
                  </div>
                  <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
                    <Input
                      id="node-name"
                      className="bg-muted/30 border-none dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all h-11 px-4 text-sm font-medium w-full outline-none"
                      style={{ '--tw-ring-color': `${themeColor}66` } as any}
                      value={selectedNode.data.label || ''}
                      onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                    />
                  </Squircle>
                </div>

                <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-xs">
                  <div className={cn(
                    "flex items-center justify-between p-4 border transition-all duration-300 w-full",
                    selectedNode.data.has_breakpoint
                      ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/5 shadow-xs rounded-xl"
                      : "bg-muted/30 dark:bg-white/5 border-border/80 dark:border-white/10 shadow-xs rounded-xl"
                  )}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="breakpoint" className={cn(
                          "text-[11px] font-bold uppercase tracking-widest",
                          selectedNode.data.has_breakpoint ? "text-amber-500" : "text-foreground/90"
                        )}>Breakpoint</Label>
                        <Info className={cn("h-3 w-3 transition-colors", selectedNode.data.has_breakpoint ? "text-amber-500/60" : "text-muted-foreground/40")} />
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground/70">Pause execution at this node</p>
                    </div>
                    <Switch
                      id="breakpoint"
                      checked={selectedNode.data.has_breakpoint || false}
                      onCheckedChange={(checked) => updateNode(selectedNode.id, { has_breakpoint: checked })}
                      className="data-[state=checked]:bg-amber-500 shrink-0"
                    />
                  </div>
                </Squircle>

                <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="mb-4">
                    <div className="mb-6 flex items-center gap-3">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: themeColor }}>Properties</h3>
                      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${themeColor}44, transparent)` }} />
                    </div>
                    {renderConfig()}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/40">
                <Squircle cornerRadius={14} cornerSmoothing={1}>
                  <Button
                    variant="destructive"
                    className="w-full h-11 font-extrabold uppercase tracking-widest text-[11px] shadow-none hover:brightness-110 active:scale-98 transition-all gap-2"
                    onClick={() => {
                      if (window.confirm('Delete this node? This cannot be undone.')) {
                        deleteNode(selectedNode.id);
                        setSelectedNodeId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Node
                  </Button>
                </Squircle>
              </div>
            </div>
          ) : (
            <div id="inspector-panel" role="tabpanel" aria-labelledby="inspector-tab" className="animate-in fade-in scale-in-95 duration-300 py-2">
              <NodeInspector nodeId={selectedNode.id} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
