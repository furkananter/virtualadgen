import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
    const { theme, setTheme } = useThemeStore();

    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
            <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-all ${theme === 'light'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                onClick={() => setTheme('light')}
                title="Light Mode"
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-all ${theme === 'dark'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-full transition-all ${theme === 'system'
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                onClick={() => setTheme('system')}
                title="System Preference"
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
};
