import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Textarea } from '@/components/ui/textarea';

interface PromptConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    template?: string;
  };
}

export const PromptConfig = ({ nodeId, config }: PromptConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template">Prompt Template</Label>
        <Textarea
          id="template"
          value={config.template || ''}
          onChange={(e) => updateNode(nodeId, { config: { ...config, template: e.target.value } })}
          placeholder="Use {{trends}} or {{text}} to inject variables..."
          className="min-h-[160px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Variables: {'{{text}}'}, {'{{image_url}}'}, {'{{trends}}'}, {'{{posts}}'}
        </p>
      </div>
    </div>
  );
};
