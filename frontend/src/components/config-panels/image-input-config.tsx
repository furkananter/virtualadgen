import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCanvasStore } from '@/stores/canvas-store';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Squircle } from '@squircle-js/react';
import { NODE_CONFIGS } from '@/components/canvas/node-configs';
import { uploadImageInput } from '@/lib/supabase/storage';
import type { CSSProperties } from 'react';
import type { NodeConfigProps, ImageInputConfigData } from '@/types/workflow';

export const ImageInputConfig = ({ nodeId, config }: NodeConfigProps<ImageInputConfigData>) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const themeColor = NODE_CONFIGS.IMAGE_INPUT.color;
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

    const toastId = toast.loading('Uploading image...');
    try {
      const publicUrl = await uploadImageInput(file);
      updateNode(nodeId, { config: { ...config, image_url: publicUrl } });
      toast.success('Image uploaded', { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast.error(message, { id: toastId });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [nodeId, config, updateNode]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {config.image_url ? (
          <div className="relative group w-full overflow-hidden border border-border/40 bg-muted/20 shadow-sm rounded-2xl">
            <img
              src={config.image_url}
              alt="Preview"
              className="w-full h-auto max-h-80 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 border rounded-xl"
              >
                <Upload className="h-3.5 w-3.5" />
                Change
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => updateNode(nodeId, { config: { ...config, image_url: '' } })}
                className="h-8 gap-1.5 rounded-xl"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-border/40 bg-muted/10 transition-all flex flex-col items-center justify-center gap-2 group hover:bg-muted/20 rounded-2xl cursor-pointer"
            style={{ borderColor: `${themeColor}22` }}
          >
            <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5" style={{ color: themeColor }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Upload Image</p>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-border/20">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" style={{ color: themeColor }} />
            <Label htmlFor="image_url" className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Image URL</Label>
          </div>
          {config.image_url?.startsWith('data:') && (
            <Squircle cornerRadius={6} cornerSmoothing={1}>
              <span className="text-[8px] font-black px-1.5 py-0.5 uppercase tracking-tighter" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>Legacy</span>
            </Squircle>
          )}
        </div>
        <Squircle cornerRadius={14} cornerSmoothing={1} className="overflow-hidden shadow-sm shadow-black/5">
          <Input
            id="image_url"
            value={config.image_url?.startsWith('data:') ? '' : (config.image_url || '')}
            onChange={(e) => {
              const value = e.target.value;
              if (value.startsWith('data:')) {
                toast.error('Base64 data URLs are not supported. Please upload instead.');
                return;
              }
              updateNode(nodeId, { config: { ...config, image_url: value } });
            }}
            placeholder="Paste URL..."
            className="border-none h-11 px-4 bg-muted/30 dark:bg-white/5 focus-visible:ring-1 focus-visible:ring-offset-0 transition-all text-sm font-medium w-full outline-none"
            style={{ '--tw-ring-color': `${themeColor}66` } as CSSProperties}
          />
        </Squircle>
      </div>
    </div>
  );
};
