'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved theme preference and apply immediately
    const savedTheme = localStorage.getItem('bdo_theme') as Theme;
    const initialTheme = (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) 
      ? savedTheme 
      : 'dark';
    
    setTheme(initialTheme);
    
    // Apply theme immediately to prevent flash
    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (initialTheme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = initialTheme;
      }
      
      setResolvedTheme(resolved);
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      
      // Update CSS custom properties
      if (resolved === 'dark') {
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#ededed');
      } else {
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#171717');
      }
    };
    
    updateResolvedTheme();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      let resolved: 'light' | 'dark';
      
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }
      
      setResolvedTheme(resolved);
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      
      // Update CSS custom properties
      if (resolved === 'dark') {
        root.style.setProperty('--background', '#0a0a0a');
        root.style.setProperty('--foreground', '#ededed');
      } else {
        root.style.setProperty('--background', '#ffffff');
        root.style.setProperty('--foreground', '#171717');
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (mounted) {
      localStorage.setItem('bdo_theme', newTheme);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider 
        value={{ 
          theme: 'dark', 
          setTheme: handleSetTheme, 
          resolvedTheme: 'dark' 
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme: handleSetTheme, 
        resolvedTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
