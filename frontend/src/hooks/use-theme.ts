import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export const useTheme = () => {
    const { theme, applyTheme } = useThemeStore();

    useEffect(() => {
        applyTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Automatic update only if theme is 'system'
        const handleChange = () => {
            if (useThemeStore.getState().theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, applyTheme]);
};
