# Digital Heroes — Master Implementation Roadmap (Phases 0–19)

> **Document Type**: Exhaustive Dependency-Aware Implementation Roadmap  
> **Rule Compliance**: Architecture Standard Part 4 § 1 ("Implementation Order & Quality Gates")  
> **Status**: Planning Baseline Established — Execution Pending Explicit User Approval  

---

## 1. Execution Dependency Graph

```
Phase 0 (Baseline) ──► Phase 1 (PRD & Assumptions) ──► Phase 2 (Architecture)
                                                               │
                                                               ▼
Phase 5 (Stripe & Billing) ◄── Phase 4 (Auth & RBAC) ◄── Phase 3 (Database Schema)
      │
      ▼
Phase 6 (Score Domain & FIFO) ──► Phase 7 (Draw Engine) ──► Phase 8 (Prize Pools)
                                                               │
                                                               ▼
Phase 10 (Winner Verif & Payouts) ◄────────────────────── Phase 9 (Charities)
      │
      ▼
Phase 11 (Public UX) ──► Phase 12 (Subscriber UX) ──► Phase 13 (Admin UX)
                                                               │
                                                               ▼
Phase 16 (Security) ◄── Phase 15 (Testing & QA) ◄── Phase 14 (Full Integration)
      │
      ▼
Phase 17 (Performance) ──► Phase 18 (Visual QA) ──► Phase 19 (Vercel & Supabase Deploy)
```

---

## 2. Phase-by-Phase Execution Plans

### Phase 0: Repository Baseline & Workspace Setup
- **Objective**: Establish development tooling, git repository, and clean package configuration.
- **Prerequisites**: Workspace inspection completed (Task 0).
- **Modules Affected**: Repository root, tooling configs.
- **Files Affected**: `package.json`, `tsconfig.json`, `.gitignore`, `eslint.config.mjs`, `vitest.config.ts`.
- **Tasks**:
  1. Initialize Git repository.
  2. Initialize Next.js 15 project with TypeScript (strict mode) and React 19.
  3. Configure Vanilla CSS Modules and import `tokens.css`.
  4. Configure Vitest and Playwright test environments.
- **Tests Required**: Verification that `npm run build` and `npm run test` execute cleanly with 0 errors.
- **Rollback Consideration**: Revert initial commit.

---

### Phase 1: PRD Analysis & Assumption Baselines
- **Objective**: Formally define and sign off on all requirements and provisional assumptions.
- **Prerequisites**: Phase 0 complete.
- **Files Affected**: `docs/PRD-ANALYSIS.md`, `docs/ASSUMPTIONS.md`.
- **Tasks**: Complete exhaustive analysis of PRD and catalog ambiguity resolutions.
- **Tests Required**: Architecture team review against PRD source.

---

### Phase 2: Architecture & Bounded Context Formalization
- **Objective**: Lock in architectural boundaries, data ownership, and directory structures.
- **Prerequisites**: Phase 1 complete.
- **Files Affected**: `docs/ARCHITECTURE.md`, `docs/DOMAIN-ARCHITECTURE.md`.
- **Tasks**: Validate layered dependency structure (Presentation → Application → Domain → Infrastructure).

---

### Phase 3: Database Schema & Migration Foundation
- **Objective**: Deploy complete PostgreSQL relational schema to Supabase with constraints, types, and triggers.
- **Prerequisites**: Phase 2 complete.
- **Files Affected**: `supabase/migrations/00001_initial_schema.sql`, `supabase/migrations/00002_triggers.sql`, `supabase/migrations/00003_rls.sql`.
- **Tasks**:
  1. Create enums (`user_role`, `subscription_status`, `draw_mode`, `match_tier`, `verification_status`, `payout_status`).
  2. Create tables (`profiles`, `plans`, `subscriptions`, `scores`, `draws`, `draw_simulations`, `prize_pools`, `charities`, `user_charity_preferences`, `charity_donations`, `winners`, `winner_verifications`, `payouts`, `stripe_webhook_events`, `audit_logs`).
  3. Implement `maintain_rolling_five_scores()` trigger.
  4. Apply Row-Level Security policies.
- **Tests Required**: Execute `tests/integration/db-constraints.test.ts`. Verify check constraints reject invalid scores (0, 46) and duplicate dates.
- **Rollback**: Down migration `00001_initial_schema.down.sql`.

---

### Phase 4: Authentication & Role-Based Access Control (RBAC)
- **Objective**: Implement secure authentication sessions, middleware gates, and server authorization helpers.
- **Prerequisites**: Phase 3 complete.
- **Modules Affected**: `modules/auth`, `middleware.ts`.
- **Files Affected**: `src/middleware.ts`, `src/modules/auth/server-guards.ts`, `src/app/(auth)/login`, `src/app/(auth)/register`.
- **Tasks**:
  1. Wire Supabase Auth with server cookie management.
  2. Implement `requireAuth()`, `requireAdmin()`, and `requireActiveSubscription()`.
  3. Configure Next.js Middleware route protection for `/dashboard/*` and `/admin/*`.
- **Tests Required**: `tests/security/auth-rbac.test.ts`.
- **Acceptance Criteria**: Unauthorized access to `/admin` returns 403 Forbidden; unauthenticated access to `/dashboard` redirects to `/login`.

---

### Phase 5: Subscription & Payment Integration
- **Objective**: Build Stripe recurring billing for monthly and yearly plans with webhook synchronization.
- **Prerequisites**: Phase 4 complete.
- **Modules Affected**: `modules/subscriptions`, `infrastructure/payments`.
- **Files Affected**: `src/app/api/webhooks/stripe/route.ts`, `src/modules/subscriptions/subscription-service.ts`, `src/app/(public)/pricing/page.tsx`.
- **Tasks**:
  1. Initialize Stripe SDK.
  2. Implement `createCheckoutSessionAction()` for Monthly (£20) and Yearly (£192).
  3. Implement webhook receiver with HMAC signature verification and idempotency ledger (`stripe_webhook_events`).
  4. Handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
  5. Implement Stripe Customer Portal redirect.
- **Tests Required**: `tests/integration/stripe-webhook.test.ts`.
- **Acceptance Criteria**: AC-SUB-01, AC-SUB-02, AC-SUB-03, AC-SUB-04.

---

### Phase 6: Score Domain & Rolling FIFO Logic
- **Objective**: Implement Stableford golf score capture, date uniqueness, and the rolling 5-score FIFO set.
- **Prerequisites**: Phase 5 complete.
- **Modules Affected**: `modules/scores`.
- **Files Affected**: `src/modules/scores/score-engine.ts`, `src/modules/scores/score-actions.ts`, `src/app/(subscriber)/scores/page.tsx`.
- **Tasks**:
  1. Implement pure validation function (`1..45`, valid date, not future).
  2. Implement `addScoreAction()`, `updateScoreAction()`, `deleteScoreAction()`.
  3. Wire UI with interactive scorecard inputs, reverse-chronological list, and rolling score transition.
- **Tests Required**: `tests/unit/scores.test.ts`.
- **Acceptance Criteria**: AC-SCR-01, AC-SCR-02, AC-SCR-03, AC-SCR-04.

---

### Phase 7: Draw Engine & Matching Logic
- **Objective**: Build the monthly draw engine supporting Random and Algorithmic modes, simulation, and matching.
- **Prerequisites**: Phase 6 complete.
- **Modules Affected**: `modules/draws`.
- **Files Affected**: `src/modules/draws/draw-engine.ts`, `src/modules/draws/matching-engine.ts`, `src/modules/draws/draw-actions.ts`.
- **Tasks**:
  1. Implement cryptographically secure uniform random draw (5 distinct numbers from 1..45).
  2. Implement score-frequency weighted algorithmic draw with Laplace smoothing.
  3. Implement set intersection matching engine (5, 4, 3 matches).
  4. Implement admin simulation action with projected winner breakdowns.
- **Tests Required**: `tests/unit/draws.test.ts`.
- **Acceptance Criteria**: AC-DRW-01, AC-DRW-02, AC-DRW-03.

---

### Phase 8: Prize Pool Allocation & Rollover
- **Objective**: Enforce 40% Tier 5, 35% Tier 4, and 25% Tier 3 pool shares, rollover jackpots, and equal multi-winner splits.
- **Prerequisites**: Phase 7 complete.
- **Modules Affected**: `modules/prizes`.
- **Files Affected**: `src/modules/prizes/prize-engine.ts`, `src/modules/prizes/prize-actions.ts`.
- **Tasks**:
  1. Implement integer-cent revenue-to-pool calculation.
  2. Implement rollover forward accounting (Tier 5 only; Tier 4/3 do not roll over).
  3. Implement multi-winner equal split with penny-remainder preservation.
- **Tests Required**: `tests/unit/prizes.test.ts`.
- **Acceptance Criteria**: AC-DRW-04.

---

### Phase 9: Charity Integration & Directory
- **Objective**: Implement charity discovery, profile pages, voluntary percentage sliders (>= 10%), and direct donations.
- **Prerequisites**: Phase 8 complete.
- **Modules Affected**: `modules/charities`.
- **Files Affected**: `src/modules/charities/charity-actions.ts`, `src/app/(public)/charities/page.tsx`, `src/app/(public)/charities/[slug]/page.tsx`, `src/app/(subscriber)/charity/page.tsx`.
- **Tasks**:
  1. Implement charity directory search and filter.
  2. Build rich charity profile with mission, images, and events.
  3. Build featured charity spotlight section on homepage.
  4. Implement subscriber contribution slider (min 10%).
  5. Implement standalone direct donation checkout route (`/api/donations/checkout`).
- **Tests Required**: `tests/unit/charity.test.ts`, `tests/integration/charity.test.ts`.
- **Acceptance Criteria**: AC-CHR-01, AC-CHR-02.

---

### Phase 10: Winner Verification & Payout Workflow
- **Objective**: Build winner detection, proof screenshot upload to private storage, admin review, and payout tracking.
- **Prerequisites**: Phase 9 complete.
- **Modules Affected**: `modules/winners`, `modules/payouts`.
- **Files Affected**: `src/modules/winners/proof-service.ts`, `src/modules/payouts/payout-service.ts`, `src/app/(subscriber)/claim/[winnerId]/page.tsx`, `src/app/(admin)/admin/winners/page.tsx`.
- **Tasks**:
  1. Trigger winner creation on draw publication.
  2. Implement secure proof file upload to private Supabase Storage bucket (`winner-proofs`).
  3. Build admin review UI with split-screen scorecard vs screenshot preview.
  4. Implement payout state machine (Pending → Paid) with transaction reference logging.
- **Tests Required**: `tests/integration/winner-verification.test.ts`.
- **Acceptance Criteria**: AC-WIN-01, AC-WIN-02, AC-WIN-03.

---

### Phase 11: Public Experience & Homepage Narrative
- **Objective**: Build the bespoke, editorial public website embodying "Feel, not fairway".
- **Prerequisites**: Foundational domains complete.
- **Files Affected**: `src/app/(public)/page.tsx`, `src/app/(public)/how-it-works/page.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`.
- **Tasks**:
  1. Implement hero viewport with live dynamic prize counter and impact statistics.
  2. Implement How It Works narrative section.
  3. Implement Featured Charity Spotlight.
  4. Implement Draw & Reward transparency preview.
  5. Implement mobile-responsive navigation header.

---

### Phase 12: Subscriber Experience & Dashboard
- **Objective**: Build the subscriber command center integrating scores, participation, charities, and winnings.
- **Prerequisites**: Phase 11 complete.
- **Files Affected**: `src/app/(subscriber)/dashboard/page.tsx`, `src/components/domain/ScoreCardGrid.tsx`, `src/components/domain/ParticipationTimeline.tsx`.
- **Tasks**:
  1. Build header with real-time membership status badge, renewal date, and billing portal link.
  2. Build score entry widget with animated 5-card FIFO grid.
  3. Build selected charity card with voluntary percentage edit.
  4. Build upcoming draw countdown with active participation summary.
  5. Build winnings overview card showing lifetime earnings and claim prompts.

---

### Phase 13: Administrator Experience (5 Surfaces)
- **Objective**: Build the full-control admin dashboard across all 5 surfaces specified in PRD § 11.
- **Prerequisites**: Phase 12 complete.
- **Files Affected**: `src/app/(admin)/admin/page.tsx`, `src/app/(admin)/admin/users/page.tsx`, `src/app/(admin)/admin/draws/page.tsx`, `src/app/(admin)/admin/charities/page.tsx`, `src/app/(admin)/admin/winners/page.tsx`.
- **Tasks**:
  1. **Surface 01: User Management**: Searchable user table, score override, subscription status toggle.
  2. **Surface 02: Draw Management**: Logic config (random vs algorithm), simulation drawer, immutable publication modal.
  3. **Surface 03: Charity Management**: Charity CRUD, media upload, event management, featured toggle.
  4. **Surface 04: Winners Management**: Proof review modal, approve/reject buttons, mark payout complete.
  5. **Surface 05: Reports & Analytics**: Total users, total prize pools, charity contribution totals, draw stats.

---

### Phase 14: System Integration & Boundary Verification
- **Objective**: End-to-end integration of all subsystems.
- **Prerequisites**: Phases 0–13 complete.
- **Tasks**: Cross-service verification: subscription purchase → score entry → draw simulation → draw publish → winner created → proof uploaded → admin approved → payout marked paid.

---

### Phase 15: Automated Testing & Verification
- **Objective**: Execute complete test suite and achieve 100% passing results across all PRD items.
- **Prerequisites**: Phase 14 complete.
- **Tasks**: Run `npm run test` (Vitest unit and integration) and `npm run test:e2e` (Playwright). Document test run results.

---

### Phase 16: Security Audit & Penetration Hardening
- **Objective**: Verify zero data leakage, enforce least-privilege RLS, and test against OWASP Top 10.
- **Prerequisites**: Phase 15 complete.
- **Tasks**: Run IDOR penetration tests, check RLS bypass prevention, verify secret leakage absence, audit webhook HMAC signing.

---

### Phase 17: Performance, Query Optimization & Caching
- **Objective**: Ensure sub-second page loads, zero N+1 database queries, and optimized array lookups.
- **Prerequisites**: Phase 16 complete.
- **Tasks**: Audit PostgreSQL execution plans on `scores` and `winners`; verify image optimization; check bundle sizes.

---

### Phase 18: Visual QA & Cross-Device Accessibility
- **Objective**: Ensure design system perfection on mobile (375px), tablet (768px), and desktop (1280px+).
- **Prerequisites**: Phase 17 complete.
- **Tasks**: Verify WCAG 2.1 AA contrast ratios, keyboard tabbing, screen reader labels, and reduced-motion compliance.

---

### Phase 19: Production Deployment & Live Verification
- **Objective**: Ship live production product to a new Vercel account and new Supabase project per PRD § 15.1.
- **Prerequisites**: All quality gates passed.
- **Tasks**: Deploy migrations to production Supabase, configure production environment variables on Vercel, verify live webhook delivery, execute smoke test with test credentials.
