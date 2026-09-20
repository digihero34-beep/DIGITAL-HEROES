# Digital Heroes — Production Deployment & DevOps Plan

> **Document Type**: Production Infrastructure, Deployment Pipeline & Environment Specification  
> **Rule Compliance**: PRD Mandatory Deliverables (§ 15, § 15.1) & DevOps Industrial Standards  
> **Target Hosting**: Vercel (Next.js Application) + Supabase (PostgreSQL, Auth, Storage)  

---

## 1. Mandatory Deployment Deliverables (PRD § 15, § 15.1)

The Digital Heroes PRD establishes non-negotiable deployment constraints:
1. **Live Website**: Fully deployed, publicly accessible URL on a **new Vercel account** (not personal/existing).
2. **Database**: Hosted PostgreSQL backend on a **new Supabase project** (not personal/existing) with verified schema migrations.
3. **User Panel**: Live, publicly accessible, functional signup, login, score entry, and dashboard with test subscriber credentials provided.
4. **Admin Panel**: Live, functional admin management across users, draws, charities, and winner verification with test admin credentials provided.
5. **Environment Configuration**: Strict separation of public environment variables from private server secrets.

---

## 2. Infrastructure Architecture & Environment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL PLATFORM                        │
│   Next.js 15 SSR, Server Actions, Route Handlers (Edge/Node) │
│   Custom Production Domain with Automatic SSL (Let's Encrypt)│
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │ HTTPS (Encrypted)                   │ HTTPS (Webhook HMAC)
            ▼                                     ▼
┌──────────────────────────────┐     ┌────────────────────────┐
│       SUPABASE CLOUD         │     │         STRIPE         │
│  - PostgreSQL 15+ (RLS)      │     │  - Customer Billing    │
│  - Supabase Auth (JWT)       │     │  - Webhook Dispatcher  │
│  - Private Storage Buckets   │     │  - Checkout Sessions   │
└──────────────────────────────┘     └────────────────────────┘
```

---

## 3. Environment Variable Configuration & Repository Link

### 3.0 Source Control Repository
- **Remote Git Repository**: `https://github.com/digihero34-beep/DIGITAL-HEROES.git`
- **Default Production Branch**: `main`
- **Deployment Trigger**: Pushes to `main` trigger automated preview/production builds on Vercel.

### 3.1 Public Variables (Client Safe)
```ini
# Application URLs
NEXT_PUBLIC_SITE_URL=https://digitalheroes.vercel.app

# Supabase Public API Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3.2 Private Server Secrets (Strictly Server-Only)
```ini
# Supabase Privileged Service Role (Bypasses RLS for trusted webhooks & background workers)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Database Direct Connection String (For running migrations)
DATABASE_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres

# Stripe Private Secrets
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# System Administrative Seed Secret
ADMIN_SEED_SECRET=<cryptographically-secure-random-token>
```

> [!CAUTION]
> Neither `SUPABASE_SERVICE_ROLE_KEY` nor `STRIPE_SECRET_KEY` may ever be committed to git or exposed to client-side code bundles.

---

## 4. Database Migration & Provisioning Protocol

1. **Supabase Project Creation**:
   - Provision a new, dedicated project on Supabase Cloud.
   - Note the Project Ref, API URL, Anon Key, and Service Role Key.
2. **Storage Bucket Provisioning**:
   - Create private storage bucket: `winner-proofs` (`public = false`).
   - Create public storage bucket: `charity-media` (`public = true`).
3. **Migration Execution**:
   - Run SQL migrations sequentially using Supabase CLI:
     ```bash
     supabase db push
     ```
   - Validates that:
     1. All enums and tables exist.
     2. Constraints (`UNIQUE`, `CHECK`) are active.
     3. Database triggers (`trg_maintain_rolling_five_scores`) are compiled and active.
     4. RLS is enabled on all tables with explicit access policies.
4. **Seed Execution**:
   - Run `supabase/seed.sql` to populate:
     - Standard subscription plans (`plan_monthly`, `plan_yearly`) with active Stripe price IDs.
     - Initial active partner charities with descriptions, logos, and upcoming golf day events.
     - Test administrator account (`admin@digitalheroes.co.in`).
     - Test subscriber account with 5 active golf scores (`subscriber@digitalheroes.co.in`).

---

## 5. Deployment Pipeline (CI/CD via Vercel)

1. **Pre-Deployment Quality Gate**:
   Prior to triggering a production build, the local/CI environment executes:
   ```bash
   npm run lint        # Zero ESLint warnings or errors
   npm run typecheck   # Zero TypeScript compiler errors (strict mode)
   npm run test        # 100% passing Vitest unit & integration tests
   npm run build       # Next.js production build succeeds
   ```
2. **Vercel Project Setup**:
   - Link repository to new Vercel account.
   - Configure all environment variables in Vercel Project Settings for the Production environment.
   - Ensure Framework Preset is set to **Next.js**.
3. **Deploy & Webhook Configuration**:
   - Trigger deployment via Vercel Git integration or CLI.
   - Retrieve deployed production domain (e.g. `https://digital-heroes.vercel.app`).
   - Configure Stripe Webhook Endpoint in Stripe Dashboard:
     - **URL**: `https://digital-heroes.vercel.app/api/webhooks/stripe`
     - **Events to Send**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
     - Copy the generated Webhook Signing Secret into Vercel environment variables as `STRIPE_WEBHOOK_SECRET`.

---

## 6. Post-Deployment Verification (Smoke Test Protocol)

Immediately following production deployment, the QA lead executes the live smoke test checklist:

| Verification Step | Target Route | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **1. Public Availability** | `GET /` | Returns HTTP 200; hero renders; charity spotlight visible; no hydration errors. | [ ] |
| **2. Charity Directory** | `GET /charities` | Displays seeded charities; search filter functions smoothly. | [ ] |
| **3. Test Subscriber Login** | `POST /login` | Authenticates test subscriber; redirects to `/dashboard`. | [ ] |
| **4. Scorecard Integrity** | `GET /dashboard` | Renders exactly 5 active scores; sorted reverse-chronologically. | [ ] |
| **5. Score Submission** | `POST /dashboard/scores` | Submits score 39 for today; oldest score moves to history; active set retains 5 scores. | [ ] |
| **6. Admin Login** | `POST /login` | Authenticates `admin@digitalheroes.co.in`; accesses `/admin`. | [ ] |
| **7. Draw Simulation** | `POST /admin/draws` | Runs simulation; displays projected winners and prize pools without publishing. | [ ] |
| **8. Security Isolation** | Direct API call | Attempt to fetch admin analytics using subscriber token; returns HTTP 403. | [ ] |

---

## 7. Rollback & Disaster Recovery Strategy

1. **Vercel Instant Rollback**: If a critical bug is discovered post-deploy, revert immediately to the previous immutable deployment artifact in Vercel Dashboard (< 5 seconds downtime).
2. **Database Recovery**: Supabase maintains automated daily point-in-time recovery (PITR). All migrations are authored with reversible down-migration scripts.
