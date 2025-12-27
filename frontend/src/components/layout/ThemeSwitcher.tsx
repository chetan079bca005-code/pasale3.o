import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { FiSun, FiMoon } from 'react-icons/fi';
import { Button } from '../ui/Button';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FiSun className="w-4 h-4" />
      ) : (
        <FiMoon className="w-4 h-4" />
      )}
    </Button>
  );
};

