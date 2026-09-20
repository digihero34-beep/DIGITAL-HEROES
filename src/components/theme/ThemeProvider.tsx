'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeOption = 'spruce' | 'navy' | 'slate';

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'spruce',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>('spruce');

  useEffect(() => {
    const saved = localStorage.getItem('dh_theme') as ThemeOption;
    if (saved && (saved === 'spruce' || saved === 'navy' || saved === 'slate')) {
      requestAnimationFrame(() => {
        setThemeState(saved);
      });
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeOption) => {
    setThemeState(newTheme);
    localStorage.setItem('dh_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
