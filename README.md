# DIGITAL HEROES — Sovereign Philanthropic Sports Platform

> **Industrial Standard Implementation** | Built for the Digital Heroes Staff Evaluation  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  
> **Repository**: [https://github.com/digihero34-beep/DIGITAL-HEROES](https://github.com/digihero34-beep/DIGITAL-HEROES)

---

## 1. Executive Summary

**Digital Heroes** is a subscription-driven web platform operating under UK jurisdiction that connects amateur golf performance tracking (Stableford format, 1–45) with accredited philanthropic fundraising and high-stakes monthly prize draws (£100,000 baseline pool with 5-number jackpot rollover).

Unlike conventional golf club websites or gaming applications, Digital Heroes implements an **institutional, broadsheet-inspired design system** (*"Feel, Not Fairway"*), completely rejecting country-club elitism, plaid patterns, and decorative clichés in favor of architectural ledgers, cryptographic trust, and measurable charity impact.

---

## 🔑 Evaluator Credentials & Quick Testing Guide

For evaluating administrative controls, draw ceremonies, winner verification queues, patron directory CRUD, and philanthropic allocation:

| User Role | Email Identifier | Password | Access Portal URL | Operational Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Sovereign Trustee (Admin)** | `admin@digitalheroes.uk` | `AdminPass123!` | [`http://localhost:3000/admin`](http://localhost:3000/admin) | Full Admin Console (System Vitals, Draw Ceremonies, Patron Directory CRUD, Winner Verifications, Charity Governance) |
| **Enrolled Subscriber (Patron)** | `subscriber@digitalheroes.uk` | `PatronPass123!` | [`http://localhost:3000/login`](http://localhost:3000/login) | Patron Dashboard, Score Entry Ledger, Charity Selection, Winnings Claims |

> **Development Mode Access Notice:**  
> In local development mode (`NODE_ENV=development`), visiting [`/admin`](http://localhost:3000/admin) automatically activates a Level 4 Sovereign Trustee session if no active session is present. Alternatively, credentials can be entered explicitly via the Trustee Login terminal at [`/admin/login`](http://localhost:3000/admin/login).

---

## 2. Core Architectural Pillars

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DIGITAL HEROES ARCHITECTURE                   │
│                                                                        │
│   [ Presentation Layer ]                                               │
│     Next.js 16 App Router · Vanilla CSS Modules · 0px Border Radius    │
│     Calibrated Tri-Theme Matrix (Spruce / Royal Navy / Highland Tartan)│
│                                │                                       │
│   [ Application Layer ]        ▼                                       │
│     Strict Server Actions · Server-Side RBAC (requireAdmin / requireAuth)│
│                                │                                       │
│   [ Domain Engine ]            ▼                                       │
│     Score FIFO Ledger · Laplace Algorithmic Draw · Integer Prize Pool  │
│                                │                                       │
│   [ Infrastructure & Data ]    ▼                                       │
│     Supabase PostgreSQL 16 · Row Level Security (RLS) · Supabase Auth   │
│     Supabase Storage (Proofs/Media) · Stripe Subscriptions & Webhooks  │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Capabilities:
1. **FIFO Rolling 5-Score Ledger (PRD § 05)**:
   - Automated PostgreSQL triggers (`trg_sync_rolling_scores`) maintain strictly the **5 most recent scores** as active (`is_active = true`) while preserving older entries for winner verification audit trails.
   - Enforces unique date per user (`uq_user_played_date`) and strict Stableford boundaries ($1 \le \text{score} \le 45$).
2. **Dual-Key Verifiable Draw Engine (PRD § 06)**:
   - Supports both **Uniform PRNG Random** (`crypto.getRandomValues`) and **Laplace-Smoothed Algorithmic Weighted** draws.
   - Set intersection matching prevents duplicate manipulation and determines `MATCH_5`, `MATCH_4`, and `MATCH_3` tiers.
   - Fully interactive Monte Carlo simulation engine with atomic draw publication and immutable results.
3. **Monetary Precision & Rollover Invariants (PRD § 07)**:
   - **100% Integer Arithmetic**: Zero IEEE 754 floating-point calculations anywhere in the financial pipeline.
   - **Deterministic Penny Remainder Division**: Distributes prime prize pools among multiple winners down to the exact single pence with zero leakage.
   - **Rollover Conservation**: 100% of unclaimed Tier 5 jackpots roll over into the next draw; unclaimed Tier 4 & 3 funds are retained in platform escrow per PRD rules.
4. **Philanthropic Directory & Voluntary Yield (PRD § 08)**:
   - Enforces mandatory minimum 10% gross subscription donation lock with optional higher contributions up to 100%.
   - Live accredited charities (*Fairway Futures Foundation*, *Adaptive Golf Alliance UK*, *Coastal Links Ecology Trust*) with public profiles, gala events, and spotlight governance.
5. **Winner Verification State Machine (PRD § 09)**:
   - Lifecycle: `pending_proof` $\to$ `submitted` $\to$ `approved` $\to$ `pending payout` $\to$ `paid`.
   - Scorecard upload validation with 10MB ceiling, strict MIME whitelist, and private storage bucket isolation.
6. **Sovereign Trust & Admin Console (`/admin`, PRD § 11)**:
   - 5 operational surfaces guarded by server-side RBAC: System Vitals Bento Grid, Winner Verification Queue, Draw Ceremony Console, Subscriber Audit Ledger, and Charity Governance Table.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.5 (Turbopack, App Router) | Zero-latency Server Components, Server Actions, streaming SSR. |
| **Language** | TypeScript 5 (Strict Mode) | Strong typing, zero `any`, domain-driven type definitions. |
| **Database & Auth** | Supabase (PostgreSQL 16, Auth, Storage) | Native Row-Level Security, transactional triggers, private storage. |
| **Payments** | Stripe API & Webhook Signatures | Idempotent event ledger, UKGC-compliant recurring subscriptions. |
| **Styling** | Vanilla CSS Modules & CSS Variables | Absolute design control, 0px border radius, high-contrast typography. |
| **Testing** | Vitest 3.2.7 | Fast, deterministic unit, integration, and security test execution. |

---

## 4. Getting Started

### Prerequisites
- Node.js 20+ installed
- PostgreSQL database or Supabase project
- Stripe account (Test Mode)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/digihero34-beep/DIGITAL-HEROES.git
   cd DIGITAL-HEROES
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```ini
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_MONTHLY=price_...
   STRIPE_PRICE_YEARLY=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. Apply database migrations & seed initial data:
   The database migrations are located under `supabase/migrations/`:
   - `00001_initial_schema.sql` (Tables & constraints)
   - `00002_triggers.sql` (FIFO rolling score triggers)
   - `00003_rls.sql` (Row-Level Security policies)
   - `00004_storage.sql` (Storage buckets & policies)
   - `seed.sql` (Plans, accredited charities, and Draw #142)

5. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 5. Automated Verification & Test Suite

The platform includes a comprehensive test suite covering all 12 evaluation targets from PRD § 16.

```bash
# Run the complete test suite (16 suites, 171 tests)
npm test

# Run strict TypeScript typechecking
npm run typecheck

# Run ESLint code quality scan
npm run lint

# Run production build compilation
npm run build
```

### Test Suite Summary:
```
 ✓ tests/integration/data-consistency.test.ts (9 tests)
 ✓ tests/integration/edge-cases.test.ts (14 tests)
 ✓ tests/integration/admin-controls.test.ts (11 tests)
 ✓ tests/integration/winner-verification.test.ts (4 tests)
 ✓ tests/integration/db-constraints.test.ts (14 tests)
 ✓ tests/integration/stripe-webhook.test.ts (9 tests)
 ✓ tests/security/auth-rbac.test.ts (15 tests)
 ✓ tests/unit/scores.test.ts (19 tests)
 ✓ tests/unit/draws.test.ts (16 tests)
 ✓ tests/unit/charity.test.ts (15 tests)
 ✓ tests/unit/prizes.test.ts (10 tests)
 ✓ tests/unit/winner-verification.test.ts (12 tests)
 ✓ tests/unit/subscriber-dashboard.test.ts (7 tests)
 ✓ tests/unit/public-navigation.test.ts (5 tests)
 ✓ tests/unit/design-system.test.ts (9 tests)
 ✓ tests/unit/baseline.test.ts (2 tests)

 Test Files  16 passed (16)
      Tests  171 passed (171)
```

---

## 6. Comprehensive Project Documentation

Full technical architecture documentation is available in the [`docs/`](./docs) directory:

- [`docs/PRD-ANALYSIS.md`](./docs/PRD-ANALYSIS.md) — Exhaustive clause-by-clause PRD analysis.
- [`docs/REQUIREMENTS-TRACEABILITY.md`](./docs/REQUIREMENTS-TRACEABILITY.md) — Full matrix linking PRD Req ID $\to$ Domain $\to$ DB $\to$ API $\to$ UI $\to$ Test.
- [`docs/EVALUATION-MATRIX.md`](./docs/EVALUATION-MATRIX.md) — Official PRD § 16 evaluation criteria mapping.
- [`docs/ASSUMPTIONS.md`](./docs/ASSUMPTIONS.md) — 10 documented engineering assumptions resolving PRD ambiguities.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — Modular Monolith architecture & ADRs.
- [`docs/DATABASE-DESIGN.md`](./docs/DATABASE-DESIGN.md) — Schema design, relational integrity, and trigger documentation.
- [`docs/DATABASE-SECURITY.md`](./docs/DATABASE-SECURITY.md) — Row-Level Security (RLS) policies and threat model.
- [`docs/DOMAIN-LOGIC.md`](./docs/DOMAIN-LOGIC.md) — Pure mathematical calculators for draw matching, scores, and prize splits.
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — Tri-theme CSS design token specifications.

---

## 7. Production Deployment (Vercel)

1. Import this repository into **[Vercel](https://vercel.com)**.
2. Under **Project Settings $\to$ Environment Variables**, configure all keys from `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL (e.g. `https://digital-heroes.vercel.app`).
4. In your Stripe Dashboard, update your Webhook Endpoint URL to:
   ```
   https://<your-vercel-domain>.vercel.app/api/webhooks/stripe
   ```
   Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.

---

## 8. License

This project is proprietary and confidential, engineered for the Digital Heroes Staff Evaluation. All rights reserved.
