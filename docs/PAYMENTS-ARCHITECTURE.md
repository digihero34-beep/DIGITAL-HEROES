# Digital Heroes — Payments & Billing Architecture

> **Document Type**: Payment Gateway Integration & Subscription Lifecycle Architecture  
> **Provider**: Stripe (PCI-DSS Level 1 Compliant)  
> **Rule Compliance**: Payment & Webhook Safety Rules (`main-core-engineering.md` § 8, Architecture Part 2 § 14)  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0, § 04  

---

## 1. Payment Integration Philosophy

Payment providers are external, distributed systems prone to network latency, duplicate event deliveries, and out-of-order notifications. Under no circumstances does the application assume payment succeeded because the client redirected back to a `/success` page. **The database subscription state is updated exclusively through verified server-side Stripe webhooks.**

---

## 2. Subscription Plans & Pricing Strategy (PRD § 04)

The platform supports two recurring membership tiers:

| Plan Identifier | Interval | Amount (Pence/Cents) | Display Price | Stripe Price ID (Env Var) | Discount Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `plan_monthly` | Month | 2,000 | £20.00 / month | `STRIPE_PRICE_MONTHLY` | Base membership rate |
| `plan_yearly` | Year | 19,200 | £192.00 / year | `STRIPE_PRICE_YEARLY` | Discounted rate (equivalent to £16.00/mo, 20% discount) |

---

## 3. Stripe Entity Mapping & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                        STRIPE                          │
│   Stripe Customer (cus_xxx)                            │
│   Stripe Subscription (sub_xxx)                        │
│   Stripe Price (price_xxx)                             │
└───────────────────────────┬────────────────────────────┘
                            │ Webhooks (HMAC Signed)
                            ▼
┌────────────────────────────────────────────────────────┐
│             DIGITAL HEROES SERVER LAYER                │
│   /api/webhooks/stripe (Signature Verification)        │
│   Idempotency Check (stripe_webhook_events)            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  DATABASE PERSISTENCE                  │
│   profiles.stripe_customer_id                          │
│   subscriptions (user_id, status, period_end)          │
└────────────────────────────────────────────────────────┘
```

---

## 4. Checkout & Onboarding Lifecycle Flow

1. **User Initiates Subscription**:
   - User navigates to `/pricing` and selects Monthly or Yearly.
   - User must be authenticated (or is redirected to `/register?redirect=/pricing`).
2. **Server Action: `createSubscriptionCheckout(planId)`**:
   - Fetches or creates a `stripe_customer_id` for the user.
   - Creates a Stripe Checkout Session:
     ```typescript
     const session = await stripe.checkout.sessions.create({
       customer: stripeCustomerId,
       payment_method_types: ['card'],
       line_items: [{ price: plan.stripePriceId, quantity: 1 }],
       mode: 'subscription',
       success_url: `${APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${APP_URL}/pricing`,
       metadata: { userId: user.id, planId },
     });
     ```
   - Returns `{ url: session.url }` to the client for secure redirect to Stripe.
3. **Completion & Webhook Trigger**:
   - User completes payment on Stripe's hosted checkout page.
   - Stripe emits `checkout.session.completed`.

---

## 5. Webhook Processing & Idempotency Pipeline

### 5.1 Webhook Route Handler (`/api/webhooks/stripe`)
1. **Raw Body Retrieval**: The incoming HTTP request raw buffer is captured (JSON parsing must be disabled on the route).
2. **Signature Verification**:
   ```typescript
   const sig = headers().get('stripe-signature')!;
   const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
   ```
   If verification fails, HTTP 400 Bad Signature is returned immediately.
3. **Idempotency Gate**:
   - Check if `event.id` exists in `public.stripe_webhook_events`.
   - If found: return HTTP 200 `{ received: true, duplicate: true }` immediately.
   - If not found: insert `event.id`, `event.type`, `payload` into `stripe_webhook_events`.
4. **Event Dispatching**:
   - Routes event to the appropriate domain handler based on `event.type`.

### 5.2 Critical Webhook Event Handlers

| Stripe Event Type | Domain Action | Database Impact |
| :--- | :--- | :--- |
| `checkout.session.completed` | Initial subscription setup | Inserts or updates row in `subscriptions` with status `active`, sets `current_period_end`. |
| `customer.subscription.updated` | Plan changes, renewals, cancellations | Updates `status`, `current_period_start`, `current_period_end`, `cancel_at_period_end`. |
| `customer.subscription.deleted` | Subscription expiration/cancellation | Sets `status = 'canceled'`, records `canceled_at = NOW()`. |
| `invoice.payment_succeeded` | Recurring billing renewal | Extends `current_period_end`, resets any past-due flags, logs active contribution. |
| `invoice.payment_failed` | Failed renewal charge | Updates `status = 'past_due'`. Initiates grace period notification. |

---

## 6. Subscription State Machine

```
[ incomplete ] ──► [ active ] ──► [ past_due ] ──► [ canceled ]
                      │               │
                      │               └──► [ active ] (payment recovered)
                      ▼
             [ cancel_at_period_end ] ──► [ canceled ] (period expired)
```

- **`active`**: Full platform privileges (enter scores, participate in draws, receive prize payouts).
- **`past_due`**: Payment failed. 7-day grace period. User warned on dashboard. If unresolved by draw date, excluded from draw matching.
- **`canceled`**: Subscription ended. Access to score entry and draws restricted; user dashboard displays subscription reactivation CTA.

---

## 7. Customer Portal (Self-Service Management)

To comply with consumer protection standards and avoid dark patterns:
- Subscribers can access the **Stripe Customer Portal** directly from `/dashboard` settings.
- Server Action `createCustomerPortalSession()` generates a short-lived URL where users can:
  - Update payment card details
  - Switch between monthly and annual plans
  - Cancel subscription (with cancellation set to take effect at the end of the current billing cycle)
  - Download official VAT/tax receipts

---

## 8. Environment Configuration & Secret Management

| Secret / Config Key | Scope | Purpose | Example / Format |
| :--- | :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Server Only | Primary API key for Stripe operations | `sk_test_...` / `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Server Only | HMAC signature secret for incoming webhooks | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public / Client | Client-side Stripe.js initialization | `pk_test_...` / `pk_live_...` |
| `STRIPE_PRICE_MONTHLY` | Server Only | Stripe Price ID for monthly plan | `price_1N...` |
| `STRIPE_PRICE_YEARLY` | Server Only | Stripe Price ID for yearly plan | `price_1N...` |

> [!CAUTION]
> Under no circumstances may `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` be exposed to client-side code or prefixed with `NEXT_PUBLIC_`.
