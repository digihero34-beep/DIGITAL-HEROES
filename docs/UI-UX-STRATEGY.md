# Digital Heroes — UI/UX Strategy & Experience Architecture

> **Document Type**: Comprehensive UX Philosophy, Interaction Strategy & Visual Architecture  
> **Rule Compliance**: Premium Product Design Master & Parts 1–7  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0, § 10, § 11, § 12  

---

## 1. Product Positioning & The "Feel, Not Fairway" Mandate

PRD § 12 establishes the non-negotiable core visual directive: **"Feel, not fairway."**
The platform must **not** resemble a traditional golf website.

```
       TRADITIONAL GOLF CLICHÉS                     DIGITAL HEROES EXPERIENCE
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│ ❌ Vast green grass fairways         │     │ ✅ Deep obsidian editorial canvas    │
│ ❌ Plaid, argyle, or tweed textures │     │ ✅ Electric mint & warm amber accents│
│ ❌ Country club elitism & badges     │     │ ✅ Purpose-driven social impact story│
│ ❌ Uninspired marketing templates    │     │ ✅ Kinetic typography & tactile data │
│ ❌ Complex scorecard grids           │     │ ✅ Fluid, intuitive score input flow │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

Golf is treated as a **mechanism of athletic participation**, while **charitable social impact and transparent prize excitement** lead the product's narrative.

---

## 2. Emotional Design & Narrative Flow

The platform's narrative connects athletic effort directly to community impact:
$$\text{PURPOSE} \longrightarrow \text{PARTICIPATION} \longrightarrow \text{PERFORMANCE} \longrightarrow \text{CONTRIBUTION} \longrightarrow \text{DRAW} \longrightarrow \text{REWARD} \longrightarrow \text{IMPACT}$$

### 2.1 The Anti-Template Homepage Narrative
Rather than a generic hero banner with three feature cards, the homepage unfolds as an engaging editorial story:
1. **The Proposition**: "Turn Your Golf Rounds Into Radical Good." Dynamic counter displaying Total Pounds Raised for Charity and Current Draw Jackpot.
2. **The Mechanism (How It Works)**:
   - Step 1: Subscribe & Choose Your Cause (minimum 10% fee directed immediately).
   - Step 2: Play Golf & Log Your 5 Stableford Scores (1–45).
   - Step 3: Enter the Monthly Draw (5 Numbers Drawn).
3. **The Featured Charity Spotlight**: A deep, human-centric hero profile of an active partner charity, showcasing real impact photography, mission narrative, and upcoming golf day galas.
4. **The Live Draw & Jackpot Preview**: Interactive lottery ball visualization demonstrating how matching 3, 4, or 5 numbers unlocks the prize pool.
5. **Radical Transparency (Where Every Penny Goes)**: A clear pie-chart breakdown showing the exact distribution of membership fees (Charity 10–100%, Prize Pool 50%, Operations/Platform).
6. **The Subscription Action**: Transparent plan selector (Monthly £20 vs Yearly £192 with 20% discount).

---

## 3. Experience Architecture Across Core Surfaces

### 3.1 Score Experience: Fluid, Engaging, Understandable (PRD § 05)
- **Challenge**: Score entry forms often feel like administrative data entry.
- **Solution**: A tactile, mobile-first scorecard widget.
  - **Numeric Range Guard**: A quick-select keypad or styled numeric stepper constrained strictly between 1 and 45.
  - **Date Selector**: Pre-selected to today's date, preventing future dates and highlighting dates already played.
  - **Rolling 5-Score Visualization**: A visual row of 5 Score Cards. When a 6th score is entered:
    - The oldest score smoothly slides into an "Archived History" drawer.
    - The new score pops into the leftmost slot with a subtle celebration shimmer.
    - A clear explanatory label states: *"Score from [Date] replaced the oldest score ([Date]). Only your 5 most recent scores are active."*

### 3.2 Draw Experience: Transparent & Exciting (PRD § 06)
- **Challenge**: The draw must feel exciting without mimicking dark-pattern gambling or casino slot machines.
- **Solution**:
  - Clean, physics-inspired ball reveal animation.
  - Winning numbers appear sequentially inside circular ceramic spheres.
  - As each ball is revealed, the subscriber's scorecard automatically highlights matching numbers with an electric mint glow.
  - Clear distinction between **Simulation Preview** (Admin only) and **Authoritative Published Result**.

### 3.3 Winner Verification Experience (PRD § 09)
- **Challenge**: Requiring users to prove their scores can introduce friction or distrust.
- **Solution**:
  - A celebratory yet clear verification portal.
  - Visual guidance showing sample screenshots from popular golf apps (Golfshot, GHIN, HowDidiDo, 18Birdies).
  - Drag-and-drop uploader with real-time image preview and file size check.
  - Multi-stage visual progress stepper:
    `[1. Score Matched] ──► [2. Screenshot Uploaded] ──► [3. In Review] ──► [4. Approved] ──► [5. Prize Paid]`

### 3.4 Subscriber Dashboard Hierarchy (PRD § 10)
Structured in order of cognitive priority:
1. **Status Banner**: Real-time membership indicator (`ACTIVE`, `PAST_DUE`), next billing date, and quick link to Stripe Billing Portal.
2. **Current Participation**: Days/hours countdown until next monthly draw, with active 5-score set displayed.
3. **Charity Impact**: Total money contributed by this user to date, with quick slider to increase contribution percentage.
4. **Winnings & Claims**: Lifetime winnings summary with prominent action card for any unclaimed prizes.

### 3.5 Admin Control Console: High Data Density (PRD § 11)
Designed for rapid operational clarity, eliminating unnecessary decoration:
- **Five Dedicated Tabs**: Users, Draws, Charities, Winners, Analytics.
- **Draw Simulation Console**: Visual side-by-side comparison of random vs algorithmic score weighting before committing to publication.
- **Verification Queue**: Split-screen modal displaying the user's entered scores and round date on the left, and the uploaded scorecard screenshot on the right, with one-click "Approve" or "Reject with Feedback".

---

## 4. State Design (Loading, Empty, Error, Success)

Every UI component must support eight standard visual states:

```
[ Default ]  ──►  [ Hover / Focus ]  ──►  [ Active / Press ]
     │
     ├─► [ Loading / Skeleton ] (Shimmer animation, disabled inputs)
     ├─► [ Empty State ] (Helpful illustration, explanatory text, primary CTA)
     ├─► [ Error State ] (Inline red alert, human-readable recovery guidance)
     └─► [ Success State ] (Green confirmation checkmark, dismissible toast)
```

---

## 5. Accessibility (WCAG 2.1 Level AA)

1. **Contrast Ratios**:
   - Primary text (`#F8FAFC`) on dark backgrounds (`#090D16`): **16.5:1** (far exceeds 4.5:1 minimum).
   - Accent text on dark surfaces: minimum **4.8:1**.
2. **Keyboard Navigation**:
   - Visible, high-contrast focus rings (`outline: 2px solid var(--accent-mint)`).
   - Logical tab indices across all forms and interactive scorecards.
3. **Screen Reader Semantics**:
   - ARIA labels on all icon-only buttons (`aria-label="Delete score from 2026-03-12"`).
   - `aria-live="polite"` regions for draw ball reveals and score updates.
4. **Motion Accessibility**:
   - All CSS animations wrapped in `@media (prefers-reduced-motion: reduce)` to disable non-essential motion for vestibular disorder protection.
