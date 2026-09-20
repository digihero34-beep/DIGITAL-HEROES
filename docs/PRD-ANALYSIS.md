# Digital Heroes — PRD Comprehensive Analysis

> **Document Type**: Exhaustive Product Requirements Specification & Requirement Extraction  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0, March 2026  
> **Audience**: Engineering Leads, System Architects, QA Engineers, Security Auditors  

---

## 1. Platform Purpose & Product Vision (§ 00, § 01)

### 1.1 Purpose
Digital Heroes is a subscription-driven web application combining:
1. **Golf performance tracking** (Stableford scoring format)
2. **Charity fundraising** (directing a portion of every subscription fee to a chosen cause)
3. **A monthly draw-based reward engine** (lottery-style or algorithmic prize pools)

### 1.2 Non-Negotiable Product Identity
The platform is designed to feel **emotionally engaging and modern**, deliberately avoiding the visual language and clichés of a traditional golf website (no fairways as dominant backgrounds, no plaid patterns, no country-club elitism). Charitable impact leads the platform's narrative, supported by athletic participation and transparent rewards.

---

## 2. Core Platform Objectives (§ 02)

The PRD defines six core objectives that together form one unified platform:

| Objective | Category | PRD Description | Architectural Focus |
| :--- | :--- | :--- | :--- |
| **Subscription Engine** | Engine | Build a robust subscription and payment system. | Stripe billing, monthly/yearly plans, lifecycle states, real-time validation. |
| **Score Entry Experience** | Experience | Simple, engaging score-entry flow. | Stableford 1–45 input, date selection, 5-score rolling FIFO retention, reverse-chronological view. |
| **Custom Draw Engine** | Engine | Algorithm-powered or random monthly draws. | Standard lottery-style draw vs score-frequency weighted draw; admin simulation and publication. |
| **Charity Integration** | Integration | Seamless charity contribution logic. | 10% min allocation, voluntary increases, independent direct donations, directory & spotlight. |
| **Admin Control** | Control | Comprehensive admin dashboard and tools. | Five control surfaces: Users, Draws, Charities, Winners, Reports & Analytics. |
| **Outstanding UI/UX** | Design | A look that stands out in the golf industry. | "Feel, not fairway", modern editorial design, micro-interactions, mobile/desktop responsiveness. |

---

## 3. User Roles & Permission Boundaries (§ 03)

The PRD defines three distinct user roles with strict access boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                       PUBLIC VISITOR                        │
│  - View concept  - Explore charities  - Understand draws   │
│  - Initiate subscription registration                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Authenticated & Subscribed
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    REGISTERED SUBSCRIBER                    │
│  - Manage profile & settings  - Enter/edit 5 scores         │
│  - Select charity & %         - View draws & winnings       │
│  - Upload winner proof screenshot                           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Elevated Admin Privilege
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        ADMINISTRATOR                        │
│  - User & score management   - Configure & run/publish draw │
│  - Manage charities & media  - Verify winner submissions    │
│  - Authorize & mark payouts  - Platform reports & analytics │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Section-by-Section Requirement Catalog

### 4.1 Subscription & Payment System (§ 04)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-SUB-01** | § 04 | Monthly plan and yearly plan with discounted rate. | Visitor / Sub | Subscriptions | Critical | Stripe Checkout / Elements integration with two Price IDs. | `plans` table storing monthly and yearly interval rates in cents. | Server-side price validation; never trust client price. | Verify checkout session creation for both plan intervals. |
| **REQ-SUB-02** | § 04 | Stripe (or equivalent PCI-compliant provider) gateway. | System | Payments | Critical | Stripe SDK; webhooks for subscription events. | `stripe_customer_id`, `stripe_subscription_id` stored on profile/sub. | PCI compliance: no raw card data ever touches our server. | Mock Stripe webhooks; verify signature handling. |
| **REQ-SUB-03** | § 04 | Non-subscribers receive restricted access to platform features. | Visitor | Auth/Access | Critical | Middleware & Server Actions block non-subscribers from score entry, draws, and dashboards. | `subscriptions.status` checked on protected routes. | IDOR / Privilege checks on all server operations. | Test accessing score/draw APIs as unauthenticated or unsubscribed user. |
| **REQ-SUB-04** | § 04 | Lifecycle: handles renewal, cancellation, and lapsed-subscription states. | Subscriber | Subscriptions | Critical | Webhook handlers for `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. | Status enum: `active`, `past_due`, `canceled`, `unpaid`, `incomplete`. | Cancellation takes effect at period end; lapsed users excluded from draws. | Test renewal webhook, cancellation at period end, and failed invoice transitions. |
| **REQ-SUB-05** | § 04 | Real-time subscription status check on every authenticated request. | Subscriber | Auth/Access | High | Validated server-side on authenticated requests via cached DB profile synchronized by webhooks. | Read `status` and `current_period_end` from database session. | Prevent stale JWT tokens bypassing revoked subscriptions. | Test immediate feature lock upon status transition to `canceled` or `past_due`. |

---

### 4.2 Score Management System (§ 05)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-SCR-01** | § 05 | Users must enter golf scores in Stableford format (range 1–45). | Subscriber | Scores | Critical | Client input validation + strict Zod schema validation in Server Action. | Check constraint: `CHECK (score >= 1 AND score <= 45)`. | Server must reject 0, 46, negative, float, or NaN inputs. | Unit tests for 0, 1, 45, 46, -1, 36.5, null. |
| **REQ-SCR-02** | § 05 | Each score must include a date. | Subscriber | Scores | High | Date picker; must be a valid ISO date (`YYYY-MM-DD`). | Column `played_date DATE NOT NULL`. | Prevent future dates beyond today if disallowed. | Test valid date strings, leap years, and missing dates. |
| **REQ-SCR-03** | § 05 | Only one score entry is permitted per date. Duplicate scores for the same date are not allowed; existing entry may only be edited or deleted. | Subscriber | Scores | Critical | Check date on insert; return conflict error if duplicate date submitted. | Unique constraint: `UNIQUE (user_id, played_date)`. | Concurrency protection: database uniqueness prevents race condition inserts. | Test submitting two scores for identical date by same user. |
| **REQ-SCR-04** | § 05 | Only the latest 5 scores are retained at any time. A new score replaces the oldest stored score automatically. | Subscriber | Scores | Critical | Domain service calculates rolling set. When 6th score arrives, oldest active score is deactivated or pruned. | Active filter `is_active = true` limited to 5 records per user; or FIFO deletion. | Ensures draw matching algorithm always operates on exactly <= 5 scores. | Test entering 1st through 6th score; verify oldest is removed from active set. |
| **REQ-SCR-05** | § 05 | Scores display in reverse chronological order (most recent first). | Subscriber | Scores | High | UI score list and server queries order by `played_date DESC`. | Index on `(user_id, played_date DESC)`. | Consistent ordering across user dashboard and admin view. | Verify query sorting and UI render order. |
| **REQ-SCR-06** | § 05 | Existing score may be edited or deleted. | Subscriber | Scores | High | Edit score value/date with date-uniqueness check; delete score restores previous active if applicable. | Update/Delete operations on `scores` table scoped to `user_id`. | Strict ownership check: `user_id == auth.uid()`. | Test edit score value, edit date to existing date (fail), delete score. |

---

### 4.3 Draw & Reward System (§ 06)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-DRW-01** | § 06 | Draw types: 5-number match, 4-number match, 3-number match. | System | Draws | Critical | Matching engine checks intersection of subscriber's active scores with the 5 drawn winning numbers. | Tiers: `MATCH_5`, `MATCH_4`, `MATCH_3`. | Authoritative calculation executed server-side only. | Test sets with 5, 4, 3, 2, 1, and 0 matches against drawn numbers. |
| **REQ-DRW-02** | § 06 | Draw logic: Random (standard lottery-style). | Admin / System | Draws | Critical | Cryptographically secure PRNG selects 5 unique integers from 1 to 45 with uniform probability. | Column `draw_type = 'random'`. Drawn numbers array `numbers INT[5]`. | Use `crypto.getRandomValues()` or PostgreSQL `pgcrypto`. | Statistical uniformity verification; uniqueness of 5 drawn numbers. |
| **REQ-DRW-03** | § 06 | Draw logic: Algorithmic (weighted by score frequency). | Admin / System | Draws | Critical | Calculates empirical frequency of all active subscriber scores (1–45) and selects 5 unique numbers weighted by frequency. | Column `draw_type = 'algorithmic'`. Snapshot of score weights saved. | Prevent manipulation of weighting function; fully deterministic given seed. | Test weighted selection distribution given skewed user score inputs. |
| **REQ-DRW-04** | § 06 | Monthly cadence. | Admin / System | Draws | High | Scheduled monthly draws, each with billing cycle period and draw date. | Column `scheduled_for TIMESTAMP WITH TIME ZONE`. | Ensure only active subscribers during the period participate. | Verify draw scheduling and monthly period boundaries. |
| **REQ-DRW-05** | § 06 | Admin controls publishing. | Administrator | Admin/Draws | Critical | Multi-phase state: Draft -> Simulated -> Published. Results invisible to public/subscribers until published. | Column `status = 'draft' \| 'simulated' \| 'published'`. | Only verified Admins can publish; publishing locks the draw permanently. | Test subscriber unable to view draft/simulated draw; publish succeeds. |
| **REQ-DRW-06** | § 06 | Simulation before publish. | Administrator | Admin/Draws | High | Admin can dry-run draw, preview drawn numbers, matching counts, and prize distributions before committing. | `draw_simulations` table or in-memory simulation result object. | Simulation must not generate real winner records or send notifications. | Test running simulation multiple times without mutating production winners. |
| **REQ-DRW-07** | § 06 | Jackpot rollover if unclaimed (5-number match only). | System | Prizes | Critical | If zero subscribers match 5 numbers, the 40% 5-match prize pool carries forward to next draw's jackpot. | Column `rollover_in_cents` and `rollover_out_cents` in `prize_pools`. | Rollover funds cannot be siphoned or miscalculated; audited balance. | Test draw with 0 5-match winners rolls over; next draw includes rollover. |

---

### 4.4 Prize Pool Logic (§ 07)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-PRZ-01** | § 07 | Fixed portion of each subscription contributes to the prize pool. | System | Prizes | Critical | Calculated as defined percentage/flat amount of active subscriber fees for the period. | `total_pool_cents` stored as integer smallest currency units. | Server-side calculation only; protected against rounding errors. | Test total pool calculation with 1, 10, 100, 1000 active subscribers. |
| **REQ-PRZ-02** | § 07 | Distribution: 5-number match = 40% (Rollover: Yes - jackpot). | System | Prizes | Critical | 40% of base pool + incoming rollover allocated to Tier 5 jackpot. | `tier_5_pool_cents INT NOT NULL`. | Protected against integer truncation discrepancies. | Test 40% allocation and rollover addition. |
| **REQ-PRZ-03** | § 07 | Distribution: 4-number match = 35% (Rollover: No). | System | Prizes | Critical | 35% of base pool allocated to Tier 4 winners. If no winners, retained by platform/charity per rules. | `tier_4_pool_cents INT NOT NULL`. | Server-side invariant: tiers sum to 100% of base pool. | Test 35% calculation across various pool totals. |
| **REQ-PRZ-04** | § 07 | Distribution: 3-number match = 25% (Rollover: No). | System | Prizes | Critical | 25% of base pool allocated to Tier 3 winners. | `tier_3_pool_cents INT NOT NULL`. | Server-side validation of distribution integrity. | Test 25% calculation across various pool totals. |
| **REQ-PRZ-05** | § 07 | Auto-calculation of each pool tier based on active subscriber count. | System | Prizes | High | Real-time calculation based on `COUNT(active_subscribers)` in current draw cycle. | Trigger or application calculation before draw simulation/publication. | Read-only calculation until published. | Test subscriber count changes dynamically updating simulated pool. |
| **REQ-PRZ-06** | § 07 | Prizes split equally among multiple winners in the same tier. | System | Prizes | Critical | Tier pool divided by `winner_count`. Remainders (cents) handled deterministically. | `prize_amount_cents = tier_pool_cents / winner_count`. | Multi-winner splits must not exceed tier pool sum. | Test 3 winners splitting £100.00 (verify £33.34, £33.33, £33.33 distribution). |

---

### 4.5 Charity System (§ 08)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-CHR-01** | § 08.1 | Users select a charity at signup. | Visitor / Sub | Charity | High | Onboarding step presents charity picker; selection saved to user profile. | Column `charity_id UUID REFERENCES charities(id)`. | Foreign key integrity; charity must be active. | Test signup with and without charity selected (default handling). |
| **REQ-CHR-02** | § 08.1 | Minimum contribution: 10% of subscription fee. | Subscriber | Charity | Critical | System enforces 10% floor. User cannot choose less than 10%. | Check constraint: `CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100)`. | Server-side validation rejects any payload with percentage < 10. | Unit tests for 0%, 5%, 9.99%, 10%, 25%, 100%, 105%. |
| **REQ-CHR-03** | § 08.1 | Users may voluntarily increase their charity percentage. | Subscriber | Charity | High | UI slider/input allowing 10% to 100% in dashboard settings. | Stored in `user_charity_preferences.contribution_percentage`. | Server checks subscriber authorization to modify own preference. | Test updating percentage to 20%, 50%; verify contribution math. |
| **REQ-CHR-04** | § 08.1 | Independent donation option, not tied to gameplay. | Public / Sub | Charity | High | Standalone donation flow via Stripe Checkout for one-off charity contributions. | `charity_donations` table tracking one-off payments. | Handled via separate Stripe PaymentIntent; does not affect draw scores. | Test direct donation flow; verify database record and total impact stats. |
| **REQ-CHR-05** | § 08.2 | Charity Directory: listing page with search and filter. | Public / Sub | Charity | High | Search by keyword/cause; filter by category; responsive grid of charities. | Full-text search index on `charities(name, mission, description)`. | Public read-only access to active charities. | Test search queries, category filters, and empty search results. |
| **REQ-CHR-06** | § 08.2 | Charity Profiles: description, images, and upcoming events (e.g. golf days). | Public / Sub | Charity | High | Detailed profile view with mission narrative, gallery, and upcoming community events. | Columns: `description TEXT`, `images TEXT[]`, `events JSONB`. | Input sanitized against XSS on admin save. | Test profile rendering with events list and empty events list. |
| **REQ-CHR-07** | § 08.2 | Spotlight: Featured charity section on the homepage. | Public | Public/Home | High | Homepage hero/spotlight showcasing designated featured charity. | Column `is_featured BOOLEAN DEFAULT false`. | Admin controls featured flag; public reads featured charity. | Test toggling featured charity in admin and observing homepage update. |

---

### 4.6 Winner Verification System (§ 09)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-WIN-01** | § 09 | Verification process applies to winners only. | System / Sub | Winners | Critical | Winner record created upon draw publish; dashboard prompts verification only if user matched >= 3 numbers. | Record in `winners` table with foreign keys to `draw_id` and `user_id`. | Non-winners cannot access verification upload flow. | Test non-winner attempting to access upload route (forbidden). |
| **REQ-WIN-02** | § 09 | Proof Upload: Screenshot of scores from the golf platform. | Winner | Winners | Critical | Secure file upload component accepting images/PDFs up to 10MB. | File saved to private Supabase Storage; reference saved in `winner_verifications`. | Strict MIME type validation (`image/png`, `image/jpeg`, `application/pdf`), virus scan/extension check, private bucket. | Test upload with valid PNG, invalid EXE, oversized file (>10MB). |
| **REQ-WIN-03** | § 09 | Admin Review: Approve or reject submission. | Administrator | Admin/Winners | Critical | Admin dashboard surface showing uploaded proof screenshot, entered scores, and action buttons. | Verification status: `pending_proof`, `submitted`, `under_review`, `approved`, `rejected`. | Only authorized admin can approve/reject; rejection requires reason. | Test admin approving submission; test admin rejecting with feedback note. |
| **REQ-WIN-04** | § 09 | Payment States: Pending -> Paid. | Administrator | Payouts | Critical | Once approved, payout enters `Pending`. Admin marks payout as `Paid` upon completing transfer. | `payouts.status` enum (`pending`, `paid`); timestamp `paid_at`. | Client cannot mark itself paid; admin-only transition with audit log. | Test complete lifecycle: winner -> upload -> approve -> pending -> paid. |

---

### 4.7 User Dashboard (§ 10)

| Req ID | PRD Section | Exact Requirement Meaning | Role | Module | Priority | Implementation Implication | Data Implication | Security Implication | Testing Implication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-DSH-01** | § 10 | Subscription status: active / inactive / renewal date. | Subscriber | Dashboard | High | Dashboard header displays real-time status pill and formatted next renewal date. | Joined from `subscriptions` table (`status`, `current_period_end`). | User can only see their own subscription data. | Test active, past_due, canceled display states. |
| **REQ-DSH-02** | § 10 | Score entry and edit interface. | Subscriber | Dashboard | High | Prominent interactive score widget: Stableford input (1–45), date picker, and 5-score list. | Real-time score list ordered reverse-chronologically. | Scoped to authenticated user ID. | Test adding, editing, and deleting scores directly from dashboard. |
| **REQ-DSH-03** | § 10 | Selected charity and contribution percentage. | Subscriber | Dashboard | High | Card displaying chosen charity logo/name and current allocation percentage with edit link. | Joined from `user_charity_preferences` and `charities`. | Isolated to user profile. | Test changing charity and updating percentage from dashboard. |
| **REQ-DSH-04** | § 10 | Participation summary: draws entered, upcoming draws. | Subscriber | Dashboard | High | Timeline of past draws entered, matched count, and countdown to next published draw. | Query `draws` and `winners` associated with `user_id`. | Accurate historical participation data. | Test user with 0 draws, 1 past draw, and active upcoming draw. |
| **REQ-DSH-05** | § 10 | Winnings overview: total won and current payment status. | Subscriber | Dashboard | High | Stat card showing lifetime earnings and breakdown of pending vs paid winnings with claim CTA. | Aggregate `SUM(prize_amount_cents)` from `winners` and `payouts`. | Financial integrity: displays authoritative server sums. | Test user with £0 winnings, pending winnings, and paid winnings. |

---

### 4.8 Admin Dashboard (§ 11)

The PRD defines five operational control surfaces for the Admin Dashboard:

| Req ID | Surface | Operations Required by PRD § 11 | Implementation Implication | Security / Audit Implication |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-ADM-01** | **01: User Management** | - View and edit user profiles<br>- Edit golf scores<br>- Manage subscriptions | Searchable/paginated user table, detail modal, score override capability, manual subscription state overrides. | Server-side admin verification; every admin edit logged in `audit_logs`. |
| **REQ-ADM-02** | **02: Draw Management** | - Configure draw logic (random vs algorithm)<br>- Run simulations<br>- Publish results | Draw control panel, logic toggle, simulation preview table, irreversible "Publish Results" action with confirmation. | Publication is an ACID transaction; freezes results and creates winner rows. |
| **REQ-ADM-03** | **03: Charity Management** | - Add, edit, delete charities<br>- Manage content and media (images, events) | CRUD interface for charities, image uploader, event JSON editor, featured charity toggle. | Admin role required; file upload validated; soft-delete to preserve history. |
| **REQ-ADM-04** | **04: Winners Management** | - View full winners list<br>- Verify submissions (proof review)<br>- Mark payouts as completed | Winners audit table, proof screenshot modal (pre-signed URL), approve/reject buttons, "Mark Paid" trigger. | Client cannot mark paid; state machine transitions strictly validated. |
| **REQ-ADM-05** | **05: Reports & Analytics** | - Total users<br>- Total prize pool<br>- Charity contribution totals<br>- Draw statistics | Analytical dashboard cards, aggregation queries for lifetime subscriber counts, total prize pools, and charity totals. | Aggregated server queries; cached or indexed for operational performance. |

---

### 4.9 UI / UX Requirements (§ 12)

| Req ID | Directive | Meaning & Execution |
| :--- | :--- | :--- |
| **REQ-UI-01** | **Feel, not fairway** | Do not resemble a traditional golf website. Lead with charitable impact and modern sports culture, not sport elitism. |
| **REQ-UI-02** | **Avoid golf clichés** | Zero fairways as full backgrounds, zero plaid textures, zero traditional country-club crests. |
| **REQ-UI-03** | **Homepage communication** | First viewport must clearly communicate: (1) what the user does, (2) how they win, (3) charity impact, (4) clear call to action. |
| **REQ-UI-04** | **Motion & micro-interactions** | Subtle transitions, button press states, score pill entrance animations, draw ball reveals. Never block navigation. |
| **REQ-UI-05** | **Prominent CTA** | Subscribe button and checkout flow must be prominent, persuasive, and transparent. |

---

### 4.10 Mandatory Deliverables & Deployment (§ 15, § 15.1)

| Deliverable | Required Standard | Target Execution |
| :--- | :--- | :--- |
| **Live Website** | Fully deployed, publicly accessible URL. | Deployed to Vercel with custom/preview domain. |
| **User Panel** | Test credentials; signup / login / score entry / dashboard all functional. | Fully authenticated Next.js client routes with test user seed. |
| **Admin Panel** | Admin credentials; user management, draw system, charities, winner verification. | Protected `/admin` routes restricted to `admin` role with test admin seed. |
| **Database** | Backend connected (e.g. Supabase) with proper schema. | Hosted Supabase PostgreSQL instance with migrations, constraints, and RLS. |
| **Source Code** | Clean, structured, well-commented codebase. | Strict TypeScript modular monolith adhering to Industrial Standards Parts 1–4. |
| **Deployment Constraints** | New Vercel account; new Supabase project; environment variables configured. | Clean infrastructure provisioning plan with documented secrets. |

---

### 4.11 Testing Checklist (§ 16.1)

The PRD mandates an 11-point testing checklist that must be satisfied and verified before declaration of completion:

1. [ ] User signup & login
2. [ ] Subscription flow (monthly and yearly)
3. [ ] Score entry — 5-score rolling logic
4. [ ] Draw system logic and simulation
5. [ ] Charity selection and contribution calculation
6. [ ] Winner verification flow and payout tracking
7. [ ] User dashboard — all modules functional
8. [ ] Admin panel — full control and usability
9. [ ] Data accuracy across all modules
10. [ ] Responsive design on mobile and desktop
11. [ ] Error handling and edge cases
