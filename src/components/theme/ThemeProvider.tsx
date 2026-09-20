'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

export type ThemeOption = 'spruce' | 'navy' | 'slate';

interface ThemeContextType {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'spruce',
  setTheme: () => {},
});

const THEME_CHANGE_EVENT = 'dh-theme-change';

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getThemeSnapshot(): ThemeOption {
  if (typeof window === 'undefined') return 'spruce';
  try {
    const saved = localStorage.getItem('dh_theme') as ThemeOption;
    if (saved === 'spruce' || saved === 'navy' || saved === 'slate') {
      return saved;
    }
  } catch {
    // LocalStorage might be restricted
  }
  return 'spruce';
}

function getServerSnapshot(): ThemeOption {
  return 'spruce';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeOption) => {
    try {
      localStorage.setItem('dh_theme', newTheme);
    } catch {
      // LocalStorage access exception handling
    }
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
