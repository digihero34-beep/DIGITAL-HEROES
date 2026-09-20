# Digital Heroes — Design System & Design Tokens Specification

> **Document Type**: Comprehensive Design Tokens, Component Standards & Style System  
> **Rule Compliance**: Premium Product Design Parts 4, 5, 6 ("Design Tokens & Visual Language")  
> **Implementation**: Pure CSS Custom Properties (`styles/tokens.css`) & CSS Modules  

---

## 1. Design Token Architecture

The design token system is configured via CSS custom properties in `:root`, ensuring a unified visual hierarchy across public, subscriber, and admin surfaces without relying on third-party CSS utility frameworks.

### 1.1 Color System (HSL & Hex)

The palette balances modern dark-mode athletic sophistication with vibrant social impact accents and trustworthy financial tones:

```css
:root {
  /* Surfaces & Backgrounds */
  --bg-primary: #080C14;           /* Deep obsidian void */
  --bg-secondary: #0F172A;         /* Slate midnight container */
  --bg-tertiary: #1E293B;          /* Elevated card surface */
  --bg-glass: rgba(15, 23, 42, 0.75); /* Glassmorphic backdrop blur */
  --border-subtle: #334155;        /* Thin structural dividing lines */
  --border-focus: #10B981;         /* Focus ring highlight */

  /* Text & Typography Hierarchy */
  --text-primary: #F8FAFC;         /* Crisp near-white high contrast */
  --text-secondary: #94A3B8;       /* Slate neutral description text */
  --text-muted: #64748B;           /* Subtle metadata and timestamp text */
  --text-inverse: #080C14;         /* Text on bright badges */

  /* Brand Accents */
  --accent-mint: #10B981;          /* Electric Emerald / Mint: Social Impact & Verification */
  --accent-mint-glow: rgba(16, 185, 129, 0.25);
  --accent-gold: #F59E0B;          /* Warm Amber Gold: Prize Pools, Jackpots & Winnings */
  --accent-gold-glow: rgba(245, 158, 11, 0.25);
  --accent-blue: #3B82F6;          /* Athletic Royal Blue: Primary Interactive Calls to Action */

  /* Semantic Status Indicators */
  --status-active-bg: rgba(16, 185, 129, 0.15);
  --status-active-text: #34D399;
  --status-warning-bg: rgba(245, 158, 11, 0.15);
  --status-warning-text: #FBBF24;
  --status-danger-bg: rgba(239, 68, 68, 0.15);
  --status-danger-text: #F87171;
  --status-info-bg: rgba(59, 130, 246, 0.15);
  --status-info-text: #60A5FA;
}
```

---

### 1.2 Typography System

Using Google Fonts (`Outfit` for display headings and numerals; `Plus Jakarta Sans` for clean UI body text):

```css
:root {
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Typography Scale */
  --text-display: clamp(2.5rem, 5vw, 4rem);    /* 40px - 64px, Leading 1.1 */
  --text-h1: clamp(2rem, 3.5vw, 2.75rem);      /* 32px - 44px, Leading 1.2 */
  --text-h2: clamp(1.5rem, 2.5vw, 2rem);       /* 24px - 32px, Leading 1.25 */
  --text-h3: 1.25rem;                          /* 20px, Leading 1.3 */
  --text-h4: 1.125rem;                         /* 18px, Leading 1.4 */
  --text-body-lg: 1.125rem;                    /* 18px, Leading 1.6 */
  --text-body: 1rem;                           /* 16px, Leading 1.5 */
  --text-body-sm: 0.875rem;                    /* 14px, Leading 1.5 */
  --text-caption: 0.75rem;                     /* 12px, Leading 1.4 */
}
```

---

### 1.3 Spacing & Layout Grid Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */

  /* Containers */
  --container-max: 1280px;
  --container-admin: 1440px;
  --container-narrow: 800px;
}
```

---

### 1.4 Elevation, Borders & Radii

```css
:root {
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5);
  --shadow-glow-mint: 0 0 20px rgba(16, 185, 129, 0.3);
  --shadow-glow-gold: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

---

### 1.5 Motion & Micro-Interactions

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-normal: 0ms;
    --transition-slow: 0ms;
  }
}
```

---

## 2. Reusable Component Standards

### 2.1 Buttons (`components/ui/Button`)
- **Primary**: Solid Royal Blue (`--accent-blue`) with crisp white text. Used for main conversions (`Subscribe Now`, `Save Score`).
- **Accent Impact**: Solid Electric Mint (`--accent-mint`) with dark obsidian text. Used for charity actions and claim submissions.
- **Secondary / Ghost**: Outline with `--border-subtle` and subtle hover surface transition.
- **Destructive**: Subdued crimson background with red text. Requires confirmation dialog on critical deletions.

### 2.2 Numeric Score Pill & Input (`components/domain/ScorePill`)
- Tactile circular or rounded-rectangular pill displaying the score value (1–45).
- Displays date underneath in `--text-muted`.
- Interactive hover shows edit/delete affordances.
- Special styling for scores >= 36 (par/better) with subtle mint glow.

### 2.3 Draw Ball (`components/domain/DrawBall`)
- Spherical ball component with 3D radial gradient depth representing numbers 1–45.
- Sequential reveal animation with subtle bounce timing.
- Active highlight if ball matches any number in the user's active scorecard.

### 2.4 Status Badges (`components/ui/StatusBadge`)
- Consistent pill badges with semantic colors:
  - `active` / `approved` / `paid` → Green (`--status-active-bg`)
  - `pending` / `submitted` / `under_review` → Amber (`--status-warning-bg`)
  - `past_due` / `canceled` / `rejected` → Red (`--status-danger-bg`)
  - `draft` / `simulated` → Blue (`--status-info-bg`)

### 2.5 Proof Uploader (`components/domain/ProofUploader`)
- Drag-and-drop zone with dotted border.
- Validates file type (`image/png`, `image/jpeg`, `application/pdf`) and size (< 10MB) before upload.
- Displays thumbnail preview with remove button and file metadata.

---

## 3. Responsive Breakpoints

| Breakpoint | Width | Target Layout Behavior |
| :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 640px` | Single-column fluid layout; full-width buttons; bottom navigation bar; stacked scorecard cards. |
| **Tablet (`md`)** | `640px – 1024px` | 2-column scorecard grids; condensed dashboard header; collapsible navigation drawer. |
| **Desktop (`lg`)** | `1024px – 1280px` | Full multi-column dashboard; fixed admin sidebar; 3-column charity directory. |
| **Wide Desktop (`xl`)** | `> 1280px` | Centered 1280px container with generous whitespace; expanded data density for admin tables. |
