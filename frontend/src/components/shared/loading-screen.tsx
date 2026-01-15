export const LoadingScreen = ({ message = 'Loading...' }: { message?: string }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]">
            <div className="flex flex-col items-center gap-6">
                {/* Modern Minimal Circle Spinner */}
                <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>

                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};
