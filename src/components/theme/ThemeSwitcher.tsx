'use client';

import React from 'react';
import { useTheme, ThemeOption } from './ThemeProvider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeOption; label: string; color: string }[] = [
    { id: 'spruce', label: 'Spruce & Ivory', color: '#001910' },
    { id: 'navy', label: 'Navy & Gold', color: '#08192d' },
    { id: 'slate', label: 'Slate & Mint', color: '#141a18' },
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-container-low)',
        padding: '2px',
        gap: '2px',
      }}
      role="group"
      aria-label="Palette Calibration Switcher"
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          padding: '0 0.4rem',
          whiteSpace: 'nowrap',
        }}
        className="hidden xl:inline"
      >
        Theme:
      </span>
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.65rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.55rem',
              background: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? 'var(--on-primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 120ms ease, color 120ms ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              whiteSpace: 'nowrap',
            }}
            title={`Switch to ${t.label}`}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: t.color,
                border: '1px solid rgba(255,255,255,0.4)',
                flexShrink: 0,
              }}
            />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
