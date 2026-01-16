import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface ImageInputConfigProps {
  nodeId: string;
  config: Record<string, unknown> & {
    image_url?: string;
  };
}

export const ImageInputConfig = ({ nodeId, config }: ImageInputConfigProps) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateNode(nodeId, { config: { ...config, image_url: base64 } });
      toast.success('Image uploaded locally');
    };
    reader.readAsDataURL(file);
  }, [nodeId, config, updateNode]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {config.image_url ? (
          <div className="relative group w-full aspect-video rounded-[20px] overflow-hidden border border-border/50 bg-muted/20">
            <img
              src={config.image_url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Upload className="h-3.5 w-3.5" />
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => updateNode(nodeId, { config: { ...config, image_url: '' } })}
                className="h-8 gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 rounded-[20px] border-2 border-dashed border-border/50 hover:border-primary/40 bg-muted/10 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <Upload className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary/60">Upload Image</p>
          </button>
        )}
      </div>

      <div className="space-y-2 pt-1 border-t border-border/20">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-primary/60" />
            <Label htmlFor="image_url" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Image URL</Label>
          </div>
          {config.image_url?.startsWith('data:') && (
            <span className="text-[8px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Local</span>
          )}
        </div>
        <Input
          id="image_url"
          value={config.image_url?.startsWith('data:') ? '' : (config.image_url || '')}
          onChange={(e) => updateNode(nodeId, { config: { ...config, image_url: e.target.value } })}
          placeholder="Paste URL..."
          className="rounded-[12px] h-8 px-3 bg-muted/20 dark:bg-white/5 border-border/80 dark:border-white/10 focus:bg-muted/30 focus:border-primary/40 transition-all text-xs"
        />
      </div>
    </div>
  );
};
