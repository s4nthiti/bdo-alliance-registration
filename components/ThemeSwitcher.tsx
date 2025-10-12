'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
  ];

  return (
    <div className="relative inline-block">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="appearance-none bg-background border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Theme selector"
      >
        {themes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        {(() => {
          const currentTheme = themes.find(t => t.value === theme);
          const IconComponent = currentTheme?.icon;
          return IconComponent ? (
            <IconComponent className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : null;
        })()}
      </div>
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    return theme === 'dark' ? Sun : Moon;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-background border border-gray-300 dark:border-gray-600 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Current: ${theme} theme`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
