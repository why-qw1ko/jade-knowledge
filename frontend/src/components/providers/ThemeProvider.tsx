'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    // Sync theme to DOM on mount (inline script already did initial set)
    setTheme(theme);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (useAppStore.getState().theme === 'system') {
        // Force re-resolve by setting system again
        useAppStore.getState().setTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Also sync when theme changes (e.g., user clicks toggle)
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
