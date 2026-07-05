import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  theme: getStoredTheme(),
  resolvedTheme: resolveTheme(getStoredTheme()),

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    const resolved = resolveTheme(theme);
    document.documentElement.setAttribute('data-theme', resolved);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const { theme } = get();
    const cycle: Theme[] = ['system', 'light', 'dark'];
    const next = cycle[(cycle.indexOf(theme) + 1) % 3];
    get().setTheme(next);
  },
}));
