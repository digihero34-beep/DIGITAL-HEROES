'use client';

import React from 'react';
import { useTheme, ThemeOption } from './ThemeProvider';

interface ThemeConfig {
  id: ThemeOption;
  label: string;
  shortLabel: string;
  color: string;
  accent: string;
  step: string;
}

const THEMES: Record<ThemeOption, ThemeConfig> = {
  spruce: {
    id: 'spruce',
    label: 'Spruce & Ivory',
    shortLabel: 'Spruce',
    color: '#001910',
    accent: '#c59b27',
    step: '1/3',
  },
  navy: {
    id: 'navy',
    label: 'Navy & Gold',
    shortLabel: 'Navy',
    color: '#08192d',
    accent: '#eec14b',
    step: '2/3',
  },
  slate: {
    id: 'slate',
    label: 'Slate & Mint',
    shortLabel: 'Slate',
    color: '#141a18',
    accent: '#10B981',
    step: '3/3',
  },
};

const NEXT_THEME: Record<ThemeOption, ThemeOption> = {
  spruce: 'navy',
  navy: 'slate',
  slate: 'spruce',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const currentTheme = THEMES[theme] || THEMES.spruce;
  const nextThemeKey = NEXT_THEME[theme] || 'spruce';
  const nextTheme = THEMES[nextThemeKey];

  const handleCycleTheme = () => {
    setTheme(nextThemeKey);
  };

  return (
    <button
      type="button"
      onClick={handleCycleTheme}
      suppressHydrationWarning
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-container-low)',
        color: 'var(--text-primary)',
        padding: '0.35rem 0.65rem',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 140ms ease',
        borderRadius: 0,
        outline: 'none',
        userSelect: 'none',
      }}
      title={`Current: ${currentTheme.label} — Click to switch to ${nextTheme.label}`}
      aria-label={`Current theme: ${currentTheme.label}. Click to switch to ${nextTheme.label}.`}
    >
      {/* Theme Color Swatch */}
      <span
        suppressHydrationWarning
        style={{
          width: 8,
          height: 8,
          background: currentTheme.color,
          border: `1px solid ${currentTheme.accent}`,
          boxShadow: `0 0 4px ${currentTheme.accent}40`,
          flexShrink: 0,
          display: 'inline-block',
        }}
        aria-hidden="true"
      />

      {/* Theme Name Label */}
      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Theme:</span>
      <span
        suppressHydrationWarning
        style={{ color: 'var(--primary)', fontWeight: 700 }}
      >
        {currentTheme.shortLabel}
      </span>

      {/* Cycle Indicator Badge */}
      <span
        suppressHydrationWarning
        style={{
          fontSize: '0.6rem',
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text-muted)',
          background: 'var(--surface-container-high, rgba(0,0,0,0.06))',
          padding: '0.1rem 0.3rem',
          border: '1px solid var(--border-subtle)',
          marginLeft: '0.15rem',
        }}
        aria-hidden="true"
      >
        {currentTheme.step} ↻
      </span>
    </button>
  );
}
