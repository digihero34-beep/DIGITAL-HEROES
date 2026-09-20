# Digital Heroes — Requirements Traceability Matrix

> **Document Type**: End-to-End Requirement Traceability  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  
> **Methodology**: PRD Requirement → Business Domain → Database Schema → Server/API Layer → UI Experience → Verification Test → Acceptance Criterion  

---

## 1. Traceability Architecture

To ensure zero requirements drift and maintain industrial compliance, every capability specified in the Digital Heroes PRD is mapped through all six layers of the system architecture:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     PRD      │ ──► │    Domain    │ ──► │   Database   │
│ Requirement  │     │    Model     │     │   Entities   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Acceptance  │ ◄── │ Verification │ ◄── │ Server / API │
│  Criterion   │     │    Tests     │     │  & UI Layer  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Comprehensive Traceability Matrix

| Req ID | PRD Ref | Domain | Database Table(s) | Server / API Layer | UI Component / Page | Test Specification | Acceptance Criterion ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-SUB-01** | § 04 | Subscriptions | `plans`, `subscriptions` | `POST /api/checkout/session` | `PricingCard`, `/pricing` | `tests/unit/plans.test.ts` | **AC-SUB-01** |
| **REQ-SUB-02** | § 04 | Payments | `subscriptions`, `stripe_events` | `POST /api/webhooks/stripe` | `StripeCheckoutModal` | `tests/integration/webhook.test.ts` | **AC-SUB-02** |
| **REQ-SUB-03** | § 04 | Access Control | `subscriptions` | `middleware.ts`, `requireSubscription()` | `RestrictedPaywall`, `/subscribe` | `tests/security/access-control.test.ts` | **AC-SUB-03** |
| **REQ-SUB-04** | § 04 | Subscriptions | `subscriptions` | `handleSubscriptionEvent()` | `SubscriptionBadge`, `/dashboard` | `tests/unit/subscription-state.test.ts` | **AC-SUB-04** |
| **REQ-SUB-05** | § 04 | Auth / Access | `subscriptions` | `getCurrentUserSubscription()` | `AppHeader`, `DashboardLayout` | `tests/security/realtime-status.test.ts` | **AC-SUB-05** |
| **REQ-SCR-01** | § 05 | Golf Scores | `scores` | `createScoreAction()` | `ScoreInputField`, `/dashboard/scores` | `tests/unit/score-validation.test.ts` | **AC-SCR-01** |
| **REQ-SCR-02** | § 05 | Golf Scores | `scores` | `createScoreAction()` | `DatePickerField`, `/dashboard/scores` | `tests/unit/score-validation.test.ts` | **AC-SCR-02** |
| **REQ-SCR-03** | § 05 | Golf Scores | `scores` | `createScoreAction()` | `ScoreEntryForm`, `/dashboard/scores` | `tests/integration/duplicate-date.test.ts` | **AC-SCR-03** |
| **REQ-SCR-04** | § 05 | Golf Scores | `scores` | `syncRollingScores()` | `ScoreCardGrid`, `/dashboard` | `tests/unit/rolling-scores.test.ts` | **AC-SCR-04** |
| **REQ-SCR-05** | § 05 | Golf Scores | `scores` | `getUserActiveScores()` | `ScoreListChronological`, `/dashboard` | `tests/unit/score-sorting.test.ts` | **AC-SCR-05** |
| **REQ-SCR-06** | § 05 | Golf Scores | `scores` | `updateScoreAction()`, `deleteScoreAction()` | `ScoreEditModal`, `DeleteConfirmDialog` | `tests/integration/score-crud.test.ts` | **AC-SCR-06** |
| **REQ-DRW-01** | § 06 | Draw Engine | `draws`, `winners` | `matchDrawNumbers()` | `MatchResultsCard`, `/draws/[id]` | `tests/unit/matching-engine.test.ts` | **AC-DRW-01** |
| **REQ-DRW-02** | § 06 | Draw Engine | `draws` | `generateRandomDraw()` | `DrawBallReveal`, `/admin/draws` | `tests/unit/random-draw.test.ts` | **AC-DRW-02** |
| **REQ-DRW-03** | § 06 | Draw Engine | `draws`, `scores` | `generateAlgorithmicDraw()` | `WeightDistributionChart`, `/admin/draws` | `tests/unit/algorithmic-draw.test.ts` | **AC-DRW-03** |
| **REQ-DRW-04** | § 06 | Draw Engine | `draws` | `scheduleMonthlyDraw()` | `UpcomingDrawCountdown`, `/dashboard` | `tests/integration/draw-cadence.test.ts` | **AC-DRW-04** |
| **REQ-DRW-05** | § 06 | Admin Draws | `draws`, `winners` | `publishDrawAction()` | `PublishDrawConfirmModal`, `/admin/draws` | `tests/integration/draw-publish.test.ts` | **AC-DRW-05** |
| **REQ-DRW-06** | § 06 | Admin Draws | `draw_simulations` | `runDrawSimulationAction()` | `SimulationResultsDrawer`, `/admin/draws` | `tests/unit/draw-simulation.test.ts` | **AC-DRW-06** |
| **REQ-DRW-07** | § 06 | Prize Pool | `prize_pools`, `draws` | `calculateRollover()` | `JackpotCounterHero`, `/` | `tests/unit/jackpot-rollover.test.ts` | **AC-DRW-07** |
| **REQ-PRZ-01** | § 07 | Prize Pool | `prize_pools` | `calculateDrawPrizePool()` | `PrizePoolStat`, `/draws` | `tests/unit/prize-pool.test.ts` | **AC-PRZ-01** |
| **REQ-PRZ-02** | § 07 | Prize Pool | `prize_pools` | `allocateTierPools()` | `Tier5JackpotDisplay`, `/draws` | `tests/unit/tier-distribution.test.ts` | **AC-PRZ-02** |
| **REQ-PRZ-03** | § 07 | Prize Pool | `prize_pools` | `allocateTierPools()` | `Tier4PrizeDisplay`, `/draws` | `tests/unit/tier-distribution.test.ts` | **AC-PRZ-03** |
| **REQ-PRZ-04** | § 07 | Prize Pool | `prize_pools` | `allocateTierPools()` | `Tier3PrizeDisplay`, `/draws` | `tests/unit/tier-distribution.test.ts` | **AC-PRZ-04** |
| **REQ-PRZ-05** | § 07 | Prize Pool | `prize_pools` | `calculateActiveSubscriberPool()` | `LivePoolEstimator`, `/admin/draws` | `tests/integration/pool-calc.test.ts` | **AC-PRZ-05** |
| **REQ-PRZ-06** | § 07 | Prize Pool | `winners`, `payouts` | `splitTierPrize()` | `WinnerCard`, `/draws/[id]` | `tests/unit/prize-split.test.ts` | **AC-PRZ-06** |
| **REQ-CHR-01** | § 08 | Charities | `user_charity_preferences` | `selectCharityAction()` | `CharitySelector`, `/onboarding` | `tests/integration/charity-select.test.ts` | **AC-CHR-01** |
| **REQ-CHR-02** | § 08 | Charities | `user_charity_preferences` | `updateContributionPctAction()` | `ContributionSlider`, `/dashboard/charity` | `tests/unit/charity-percentage.test.ts` | **AC-CHR-02** |
| **REQ-CHR-03** | § 08 | Charities | `user_charity_preferences` | `updateContributionPctAction()` | `ContributionSlider`, `/dashboard/charity` | `tests/unit/charity-percentage.test.ts` | **AC-CHR-03** |
| **REQ-CHR-04** | § 08 | Charities | `charity_donations` | `POST /api/donations/checkout` | `DirectDonationModal`, `/charities/[slug]` | `tests/integration/donation.test.ts` | **AC-CHR-04** |
| **REQ-CHR-05** | § 08 | Charities | `charities` | `searchCharities()` | `CharityDirectory`, `/charities` | `tests/e2e/charity-directory.spec.ts` | **AC-CHR-05** |
| **REQ-CHR-06** | § 08 | Charities | `charities` | `getCharityBySlug()` | `CharityProfileView`, `/charities/[slug]` | `tests/e2e/charity-profile.spec.ts` | **AC-CHR-06** |
| **REQ-CHR-07** | § 08 | Charities | `charities` | `getFeaturedCharity()` | `CharitySpotlightSection`, `/` | `tests/e2e/homepage.spec.ts` | **AC-CHR-07** |
| **REQ-WIN-01** | § 09 | Winners | `winners` | `getWinnerStatus()` | `WinnerBanner`, `/dashboard` | `tests/security/winner-eligibility.test.ts` | **AC-WIN-01** |
| **REQ-WIN-02** | § 09 | Winners | `winner_verifications` | `submitProofAction()` | `ProofUploader`, `/dashboard/claim/[id]` | `tests/security/file-upload.test.ts` | **AC-WIN-02** |
| **REQ-WIN-03** | § 09 | Admin Winners | `winner_verifications`, `winners` | `reviewProofAction()` | `ProofReviewModal`, `/admin/winners` | `tests/integration/winner-review.test.ts` | **AC-WIN-03** |
| **REQ-WIN-04** | § 09 | Payouts | `payouts` | `markPayoutPaidAction()` | `PayoutStatusBadge`, `/admin/payouts` | `tests/integration/payout-state.test.ts` | **AC-WIN-04** |
| **REQ-DSH-01** | § 10 | Dashboard | `subscriptions` | `getDashboardOverview()` | `SubscriptionStatusPill`, `/dashboard` | `tests/e2e/dashboard.spec.ts` | **AC-DSH-01** |
| **REQ-DSH-02** | § 10 | Dashboard | `scores` | `getDashboardOverview()` | `DashboardScoreWidget`, `/dashboard` | `tests/e2e/dashboard.spec.ts` | **AC-DSH-02** |
| **REQ-DSH-03** | § 10 | Dashboard | `user_charity_preferences` | `getDashboardOverview()` | `DashboardCharityCard`, `/dashboard` | `tests/e2e/dashboard.spec.ts` | **AC-DSH-03** |
| **REQ-DSH-04** | § 10 | Dashboard | `draws`, `winners` | `getDashboardOverview()` | `ParticipationTimeline`, `/dashboard` | `tests/e2e/dashboard.spec.ts` | **AC-DSH-04** |
| **REQ-DSH-05** | § 10 | Dashboard | `winners`, `payouts` | `getDashboardOverview()` | `WinningsSummaryCard`, `/dashboard` | `tests/e2e/dashboard.spec.ts` | **AC-DSH-05** |
| **REQ-ADM-01** | § 11 | Administration | `profiles`, `subscriptions`, `scores` | `adminUpdateUserAction()` | `AdminUsersTable`, `/admin/users` | `tests/security/admin-rbac.test.ts` | **AC-ADM-01** |
| **REQ-ADM-02** | § 11 | Administration | `draws`, `draw_simulations` | `adminConfigureDrawAction()` | `DrawControlConsole`, `/admin/draws` | `tests/integration/admin-draws.test.ts` | **AC-ADM-02** |
| **REQ-ADM-03** | § 11 | Administration | `charities` | `adminSaveCharityAction()` | `CharityManagementTable`, `/admin/charities` | `tests/integration/admin-charities.test.ts` | **AC-ADM-03** |
| **REQ-ADM-04** | § 11 | Administration | `winners`, `payouts` | `adminVerifyWinnerAction()` | `WinnerVerificationQueue`, `/admin/winners` | `tests/integration/admin-verification.test.ts` | **AC-ADM-04** |
| **REQ-ADM-05** | § 11 | Administration | All Entities | `getAdminPlatformStats()` | `AnalyticsMetricGrid`, `/admin` | `tests/integration/admin-analytics.test.ts` | **AC-ADM-05** |
| **REQ-UI-01** | § 12 | UI / UX | CSS Tokens | Theme System | Root Layout & Global CSS | Visual QA inspection | **AC-UI-01** |
| **REQ-UI-03** | § 12 | Public UX | Content | Page Service | Homepage Hero & Narrative, `/` | Lighthouse & UX review | **AC-UI-03** |
| **REQ-UI-04** | § 12 | Interaction | Animation Tokens | CSS Keyframes & Framer | Micro-interaction Components | Reduced-motion test | **AC-UI-04** |

---

## 3. Verification Protocol

During Phase 15 (Testing) and Phase 16 (Quality Gates), each row in this matrix will be verified through automated unit tests, integration test fixtures, and Playwright end-to-end assertions against the corresponding Acceptance Criterion ID defined in `docs/ACCEPTANCE-CRITERIA.md`.
