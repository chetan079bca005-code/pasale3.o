import { create } from 'zustand';

// Basic Dark and Light modes supported, plus Classic specific overrides
export type Theme = 'light' | 'classic' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('pasale-theme') as Theme;
  if (['light', 'classic', 'dark'].includes(stored)) return stored;
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pasale-theme', theme);
      // Update document class for theme
      document.documentElement.classList.remove('light', 'dark', 'classic');

      if (theme === 'dark' || theme === 'classic') {
        document.documentElement.classList.add('dark');
      }
      if (theme === 'classic') {
        document.documentElement.classList.add('classic');
      }

      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      // Cycle: light -> dark -> classic -> light
      // Or simple toggle light <-> dark if only using those. 
      // Given visual switcher exists, we can stick to simple light/dark toggle or cycle.
      // Let's implement cycle for fun, or just flip-flop based on current.
      // If current is dark or classic -> go light. If light -> go dark.
      const newTheme: Theme = (state.theme === 'dark' || state.theme === 'classic') ? 'light' : 'dark';

      if (typeof window !== 'undefined') {
        localStorage.setItem('pasale-theme', newTheme);
        document.documentElement.classList.remove('light', 'dark', 'classic');
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      return { theme: newTheme };
    });
  },
}));


