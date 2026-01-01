import { create } from 'zustand';

export type Theme = 'light' | 'classic' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('pasale-theme') as Theme) || 'dark';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pasale-theme', theme);
      // Update document class for theme
      document.documentElement.classList.remove('light', 'classic', 'dark');
      if (theme === 'dark' || theme === 'classic') {
        document.documentElement.classList.add('dark');
      }
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },
  toggleTheme: () => {
    set((state) => {
      const themes: Theme[] = ['light', 'classic', 'dark'];
      const currentIndex = themes.indexOf(state.theme);
      const newTheme = themes[(currentIndex + 1) % themes.length];
      if (typeof window !== 'undefined') {
        localStorage.setItem('pasale-theme', newTheme);
        document.documentElement.classList.remove('light', 'classic', 'dark');
        if (newTheme === 'dark' || newTheme === 'classic') {
          document.documentElement.classList.add('dark');
        }
        document.documentElement.setAttribute('data-theme', newTheme);
      }
      return { theme: newTheme };
    });
  },
}));

