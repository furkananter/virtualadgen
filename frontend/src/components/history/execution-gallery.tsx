import { ExternalLink, Image as ImageIcon } from 'lucide-react';

interface ExecutionGalleryProps {
    imageUrls: string[];
}

export const ExecutionGallery = ({ imageUrls }: ExecutionGalleryProps) => {
    if (!imageUrls || imageUrls.length === 0) {
        return (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium bg-muted/10 p-2 rounded-lg border border-dashed border-border/40 w-fit">
                <ImageIcon className="h-3 w-3 opacity-40" />
                <span>No images generated in this run</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imageUrls.map((url, i) => (
                <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-muted/40 hover:border-primary/20 transition-all">
                    <img
                        src={url}
                        alt={`Generation ${i}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                    />
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-4 w-4 text-white" />
                    </a>
                </div>
            ))}
        </div>
    );
};
