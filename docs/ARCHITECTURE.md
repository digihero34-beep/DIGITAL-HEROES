# Digital Heroes — System Architecture Document

> **Document Type**: Master Technical Architecture & System Design  
> **Rule Compliance**: Architecture Industrial Standard Parts 1–4  
> **Architecture Pattern**: Clean Modular Monolith with Layered Hexagonal Boundaries  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  

---

## 1. Architectural Philosophy & Strategy

Digital Heroes is architected as an **industrial-grade Modular Monolith**. Microservice sprawl is explicitly rejected because the platform's core workflows (scoring, draw matching, prize allocation, and winner verification) require strong ACID transactional consistency and unified relational data integrity within a single domain boundary.

### 1.1 Architectural Layers

The system strictly enforces the dependency rule: dependencies point inward toward stable domain abstractions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│   Next.js 15 App Router  │  React 19 Server & Client Components       │
│   Vanilla CSS Modules    │  Design Tokens  │  Form Actions             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                               │
│   Use Case Interactors   │  Command Handlers  │  Query Services        │
│   Server Actions         │  Route Handlers    │  Transaction Wrapper   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                  │
│   Pure Domain Entities   │  Calculators       │  State Machines        │
│   Score Engine           │  Draw Engine       │  Prize Pool Engine     │
│   Value Objects          │  Domain Invariants │  Domain Exceptions     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE ADAPTERS                            │
│   Supabase Postgres DAL  │  Stripe Gateway    │  Supabase Storage DAL  │
│   Crypto PRNG Adapter    │  Logger (Pino/JSON)│  Email Notification    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES & PERSISTENCE                    │
│   PostgreSQL 15+ (RLS)   │  Stripe API        │  S3 / Supabase Storage │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Module Structure

The project structure organizes code by business domain rather than generic technical groupings:

```
src/
├── app/                                 # Next.js App Router (Presentation)
│   ├── (public)/                        # Public visitor routes
│   │   ├── page.tsx                     # Landing page with charity spotlight
│   │   ├── how-it-works/page.tsx        # Draw & scoring explanation
│   │   ├── charities/                   # Charity directory & detail
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── pricing/page.tsx             # Monthly & yearly plans
│   ├── (auth)/                          # Authentication flows
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (subscriber)/                    # Protected Subscriber routes
│   │   ├── layout.tsx                   # Auth & Subscription verification gate
│   │   ├── dashboard/page.tsx           # Subscriber central dashboard
│   │   ├── scores/page.tsx              # Golf score management interface
│   │   ├── charity/page.tsx             # Charity selection & % slider
│   │   ├── draws/page.tsx               # Participation & draw results
│   │   └── claim/[winnerId]/page.tsx    # Winner proof upload flow
│   ├── (admin)/                         # Protected Administrator routes
│   │   ├── layout.tsx                   # Server-side Admin role guard
│   │   ├── admin/page.tsx               # Analytics & system overview
│   │   ├── admin/users/page.tsx         # User & subscription control
│   │   ├── admin/draws/page.tsx         # Draw config, simulation, & publish
│   │   ├── admin/charities/page.tsx     # Charity CRUD & media management
│   │   ├── admin/winners/page.tsx       # Winner proof review queue
│   │   └── admin/payouts/page.tsx       # Payout fulfillment tracking
│   ├── api/                             # Route Handlers (Webhooks & APIs)
│   │   ├── webhooks/stripe/route.ts     # Stripe webhook receiver
│   │   └── donations/route.ts           # Direct charity donation checkout
│   ├── layout.tsx                       # Root layout & font provider
│   ├── not-found.tsx                    # Custom 404 page
│   └── error.tsx                        # Global error boundary
├── modules/                             # Domain Modules (Application + Domain)
│   ├── auth/                            # Session, RBAC, credentials
│   ├── users/                           # Profiles & user accounts
│   ├── subscriptions/                   # Plans, billing, Stripe sync
│   ├── scores/                          # Stableford scoring, 5-score FIFO
│   ├── draws/                           # Random/Algorithmic draws, simulation
│   ├── prizes/                          # Pool math, tier splits, rollover
│   ├── charities/                       # Directory, profiles, allocations
│   ├── winners/                         # Winner detection, proof upload/review
│   ├── payouts/                         # Fulfillment state machine
│   └── admin/                           # Cross-domain admin operations
├── components/                          # Reusable UI Component Library
│   ├── ui/                              # Atoms: Button, Input, Modal, etc.
│   ├── layout/                          # Header, Footer, Sidebar, Containers
│   └── domain/                          # Specialized components (DrawBall, ScorePill)
├── infrastructure/                      # Technical Adapters & I/O
│   ├── database/                        # Supabase client, queries, transactions
│   ├── storage/                         # Supabase Storage client (signed URLs)
│   ├── payments/                        # Stripe client & webhook helpers
│   ├── logging/                         # Structured logger
│   └── email/                           # Notification client
├── lib/                                 # Shared pure utilities & constants
│   ├── constants/                       # Business constants (scores, prize shares)
│   ├── validation/                      # Shared Zod schemas
│   └── utils/                           # Formatting, money math, assertions
└── styles/                              # Design system tokens & global CSS
    ├── tokens.css                       # Colors, typography, spacing variables
    ├── reset.css                        # Modern CSS reset
    └── globals.css                      # Base typography & surface classes
```

---

## 3. Core Architectural Subsystems

### 3.1 Authentication & Authorization Pipeline
- **Authentication**: Managed via Supabase Auth. Sessions are stored in secure, `HttpOnly`, `SameSite=Lax` cookies managed server-side.
- **Role-Based Access Control (RBAC)**:
  - Three distinct roles: `public`, `subscriber`, `admin`.
  - Roles are stored in `public.profiles.role` and verified in server middleware and Server Actions using `requireAdmin()` and `requireActiveSubscription()`.
  - Client state is never trusted for authorization decisions.

### 3.2 Server-Side Mutation Boundaries (Server Actions)
- All user-triggered state mutations (entering scores, choosing charities, publishing draws, reviewing proofs) execute through **Next.js Server Actions**.
- Every Server Action follows an identical execution pipeline:
  1. **Authentication Check**: Verify user identity.
  2. **Authorization Check**: Verify required role/ownership.
  3. **Input Validation**: Validate payload using a strict Zod schema.
  4. **Domain Invariant Enforcement**: Execute business calculations and state machine checks.
  5. **Transactional Persistence**: Commit to database inside an ACID transaction where multi-row operations occur.
  6. **Audit & Cache Invalidation**: Emit audit log and call `revalidatePath()` / `revalidateTag()`.
  7. **Typed Result**: Return `{ success: true, data }` or `{ success: false, error }`.

### 3.3 Payment & Webhook Architecture
- **Provider**: Stripe (PCI-DSS compliant).
- **Security**: Raw cardholder data never touches our application servers.
- **Webhook Pipeline**:
  1. Stripe signs each webhook with a secret key (`Stripe-Signature` header).
  2. The webhook Route Handler verifies the signature using `stripe.webhooks.constructEvent()`.
  3. The event is recorded in `stripe_webhook_events` with an idempotency check (`event_id`).
  4. The event is processed by the Subscription service to transition subscriber state.
  5. HTTP 200 is returned immediately. If internal processing fails, HTTP 500 triggers Stripe's automatic retry backoff.

### 3.4 Draw Engine Architecture
The Draw Engine strictly separates in-memory simulation from authoritative database publication:
- **Number Generation**:
  - **Random Mode**: Cryptographically secure PRNG (`crypto.getRandomValues`) uniformly samples 5 distinct numbers from `[1, 45]`.
  - **Algorithmic Mode**: Calculates frequency distribution of all active player scores: $P(x) \propto (F_x + 1)$. Samples 5 distinct numbers without replacement weighted by this distribution.
- **Simulation**:
  - Runs in-memory. Calculates matching subscriber counts for Tier 5, Tier 4, and Tier 3, along with projected prize amounts. Returns preview data without writing to `winners` or mutating balances.
- **Publication (The Immutable Event)**:
  - Executes inside a single PostgreSQL database transaction:
    1. Verify draw is in `draft` or `simulated` status.
    2. Transition draw status to `published` and record `numbers`, `published_at`, and `admin_id`.
    3. Calculate total pool and rollover.
    4. Query all active subscribers' scores and compute set intersections.
    5. Bulk insert matching rows into `winners` with tier and prize amounts.
    6. Record outgoing rollover in `prize_pools`.
    7. Write an audit log entry.
  - Once published, draw numbers and winners can never be modified.

### 3.5 File Storage Architecture
- Winner proof screenshots (scorecard screenshots from golf apps) are stored in a **private** Supabase Storage bucket (`winner-proofs`).
- Public read access is completely disabled at the bucket level.
- Uploads require an active winner record matching the authenticated user.
- Administrators and the winning user view files exclusively via **short-lived signed URLs** generated on demand with a 15-minute TTL.

---

## 4. Architectural Decision Records (ADRs)

### ADR-01: Modular Monolith vs Microservices
- **Decision**: Adopt a Modular Monolith built on Next.js 15 and Supabase.
- **Alternatives Considered**: Decoupled microservices (separate Go/Node scoring service, payment service, and draw worker).
- **Reason**: The Digital Heroes domain requires tight transactional consistency between subscriptions, score FIFO retention, draw publishing, and prize allocation. Microservices introduce distributed transaction overhead (sagas, 2PC), eventual consistency bugs in financial calculations, and unnecessary operational complexity for a trainee selection assignment.
- **Consequences**: Fast development velocity, single unified deployment on Vercel, atomic database transactions, zero network latency between modules.

### ADR-02: Next.js App Router with Server Actions as Application Service Boundary
- **Decision**: Use Next.js 15 App Router with Server Actions for all application commands and Route Handlers for webhooks.
- **Alternatives Considered**: Separate Express/Fastify REST API backend; GraphQL API.
- **Reason**: Server Actions provide type-safe RPC directly from UI forms while guaranteeing server-side execution, eliminating boilerplate API endpoints and ensuring zero client-side leakage of business logic or secrets.
- **Consequences**: Clean separation of server and client boundaries; native integration with React 19 transitions and Vercel edge/node runtime.

### ADR-03: Supabase PostgreSQL with Server-Side DAL + RLS
- **Decision**: Use Supabase PostgreSQL as the authoritative datastore, utilizing Row-Level Security (RLS) as a defense-in-depth layer while executing critical business transactions through a typed server-side Data Access Layer (DAL) using the service-role client.
- **Alternatives Considered**: Client-side direct Supabase SDK calls with pure RLS.
- **Reason**: The Architecture rules strictly forbid trusting the client or placing complex business calculations in SQL triggers alone. Server-side orchestration ensures full control over validation, error logging, and external service calls (Stripe, Storage) before database commit.
- **Consequences**: Defense-in-depth: database enforces constraints and isolates data; server enforces business workflows and orchestrates external side effects.

### ADR-04: Integer Smallest Currency Units (Pence/Cents) for All Financial Math
- **Decision**: All subscription fees, prize pools, charity donations, and payouts must be calculated and stored as 64-bit integers representing cents/pence.
- **Alternatives Considered**: IEEE 754 floating point (`float`, `double`), arbitrary precision decimals (`numeric`).
- **Reason**: Floating-point math causes catastrophic rounding errors (e.g. `0.1 + 0.2 = 0.30000000000000004`). Integers eliminate rounding drift entirely and align directly with Stripe's native API.
- **Consequences**: Exact monetary arithmetic throughout the entire codebase.

### ADR-05: Vanilla CSS Modules with Design Tokens vs TailwindCSS
- **Decision**: Use Vanilla CSS Modules powered by centralized CSS custom properties (`tokens.css`).
- **Alternatives Considered**: TailwindCSS.
- **Reason**: The project instructions and rules explicitly specify: "Avoid using TailwindCSS unless the USER explicitly requests it". Vanilla CSS Modules grant complete, unconstrained design freedom, ensuring the UI avoids generic SaaS template aesthetics and achieves a bespoke, editorial look.
- **Consequences**: High CSS maintainability, zero bloated build-time utility classes, handcrafted micro-interactions.

---

## 5. Non-Functional Requirements & Scalability Strategy

1. **Performance**:
   - Server-Side Rendering (SSR) for initial page loads ensures sub-second Largest Contentful Paint (LCP < 1.2s).
   - Database queries on active scores and subscriptions utilize composite B-tree indexes (`user_id`, `is_active`, `played_date`).
2. **Scalability**:
   - Stateless Next.js container handles horizontal scaling effortlessly on Vercel's global CDN and serverless runtime.
   - Draw matching queries use set-based PostgreSQL array operations (`&&` intersection operator), allowing matching 100,000 subscriber scores against 5 drawn numbers in under 200 milliseconds.
3. **Observability**:
   - Centralized structured JSON logger records every authentication event, draw simulation, publication, and webhook reception with correlation IDs.
