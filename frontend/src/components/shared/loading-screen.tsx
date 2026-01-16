import { cn } from '@/lib/utils';

export const LoadingScreen = ({ message = 'Processing' }: { message?: string }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md z-[9999]">
            <div className="relative flex flex-col items-center gap-6">
                {/* Simple & Premium Spinner */}
                <div className="relative w-12 h-12">
                    {/* Track */}
                    <div className="absolute inset-0 rounded-full border-[3px] border-primary/10" />

                    {/* Moving Gradient Path */}
                    <div
                        className={cn(
                            "absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin",
                            "after:absolute after:inset-[-3px] after:rounded-full after:border-[3px] after:border-transparent after:border-t-primary/30 after:blur-[2px]"
                        )}
                    />

                    {/* Center Dot */}
                    <div className="absolute inset-[35%] bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40 animate-pulse">
                        {message}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
    );
};
