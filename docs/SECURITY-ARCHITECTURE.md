# Digital Heroes — Security Architecture & Threat Mitigation

> **Document Type**: Comprehensive Security Architecture & Threat Modeling  
> **Rule Compliance**: Security Rules (`security.md`), Architecture Standard Part 2 § 1–4, 16  
> **Target Standard**: OWASP Top 10 Compliance, Defense-in-Depth, Zero-Trust Client  

---

## 1. Zero-Trust Client Principle

The browser client is treated as an untrusted environment. Under no circumstances does the application rely on client-supplied:
- User roles (`role === 'admin'`)
- Subscription status (`is_active: true`)
- Winner verification state (`verification_status: 'approved'`)
- Payout state (`payout_status: 'paid'`)
- Calculated prize amounts or charity donations

All authorization gates, state transitions, and calculations are computed and validated exclusively on the server.

---

## 2. Threat Modeling & Mitigation Matrix

| Threat ID | Threat Category | Threat Description | Affected Area | Architectural Mitigation | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **THR-01** | **IDOR / Data Leakage** | Subscriber A attempts to access Subscriber B's scores, subscription, or winnings. | Scores, Subscriptions, Winnings | Server Actions enforce `auth.uid() = user_id`. Supabase RLS isolates database queries. | Automated integration test: User A token queries User B ID → 403 Forbidden. |
| **THR-02** | **Privilege Escalation** | Regular subscriber submits `role: 'admin'` in profile update payload. | Profile Update / Auth | Server Action ignores `role` field. Database RLS blocks updating the `role` column. | Unit test with injected payload `{ role: 'admin' }` → role remains `subscriber`. |
| **THR-03** | **Stripe Webhook Forgery** | Attacker sends crafted fake webhook payloads to activate free subscriptions. | Payment Webhooks | Webhook handler verifies HMAC-SHA256 signature using `stripe.webhooks.constructEvent()` with raw body. | Send unsigned webhook → server returns HTTP 400 Bad Signature. |
| **THR-04** | **Webhook Replay / Duplication** | Stripe delivers duplicate webhook events, risking double credits or state corruption. | Payment Webhooks | Idempotency ledger (`stripe_webhook_events`). Event ID checked before processing; duplicates return HTTP 200 immediately. | Replay identical event twice → handler returns 200 with zero duplicate mutations. |
| **THR-05** | **Malicious File Upload** | Attacker uploads executable malware (`.exe`, `.php`) masquerading as a score screenshot. | Winner Verification | File validation checks magic bytes (file signatures), enforces MIME type whitelist (`image/png`, `image/jpeg`, `application/pdf`), and 10MB size limit. Files stored in private bucket with random UUID filenames. | Upload renamed `.exe` file → rejected with `InvalidFileTypeError`. |
| **THR-06** | **State Manipulation: Direct Payout** | Winner attempts to mark their own payout as `Paid` via API manipulation. | Payouts | Payout status transition to `paid` requires `requireAdmin()` check and valid `transaction_reference`. | Subscriber calls `markPayoutPaidAction()` → throws `UnauthorizedAdminError`. |
| **THR-07** | **SQL Injection** | Attacker inputs SQL injection strings into charity search or score fields. | Database Queries | 100% parameterized queries via Supabase client / PostgreSQL prepared statements. Zero string concatenation in SQL. | Run SQLMap / payload injection test on search inputs → treated as literal search strings. |
| **THR-08** | **Cross-Site Scripting (XSS)** | Attacker injects `<script>` tags into charity descriptions or event names. | Public Charity Views | React automatically escapes JSX expressions. Admin charity inputs sanitized using `DOMPurify` before storage. | Inject `<script>alert(1)</script>` → rendered as sanitized text string. |
| **THR-09** | **Cross-Site Request Forgery (CSRF)** | Attacker lures user to malicious site triggering score mutations. | Server Actions | Next.js Server Actions utilize internal encrypted action tokens and `SameSite=Lax` cookies to prevent cross-origin execution. | Cross-origin POST to action endpoint fails CSRF origin check. |
| **THR-10** | **Score Invariant Tampering** | Attacker submits score outside 1–45 or multiple scores on the same date. | Golf Scores | Zod schema validation on server + PostgreSQL `CHECK (score >= 1 AND score <= 45)` + `UNIQUE(user_id, played_date)`. | Concurrent submission test for same date → second request fails with 409 Conflict. |
| **THR-11** | **Prize Pool Inflation** | Attacker manipulates prize calculation or winner count to siphon platform funds. | Draw Publication | Draw publication executes inside an atomic PostgreSQL transaction. Prize shares computed server-side via pure integer math. | Publish draw simulation audit comparison test. |
| **THR-12** | **Credential / Secret Exposure** | Private API keys or database service roles leaked in client bundles. | Deployment & Bundling | Secrets strictly stored in `.env.local` without `NEXT_PUBLIC_` prefix. CI build lint verifies zero client imports of server secrets. | Client bundle source-map audit confirms absence of Stripe Secret Key or Supabase Service Key. |

---

## 3. Server-Side Authorization Guards

The application implements composable, strictly typed server authorization guards:

```typescript
// Guard: Require Authenticated User
export async function requireAuth(): Promise<AuthUser> {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new UnauthorizedError("Authentication required.");
  }
  return { id: user.id, email: user.email! };
}

// Guard: Require Active Subscription
export async function requireActiveSubscription(userId: string): Promise<SubscriptionRecord> {
  const sub = await getSubscriptionByUserId(userId);
  if (!sub || sub.status !== 'active') {
    throw new ForbiddenError("Active subscription required to perform this action.");
  }
  return sub;
}

// Guard: Require Administrator Role
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  const profile = await getProfileByUserId(user.id);
  if (!profile || profile.role !== 'admin') {
    throw new ForbiddenError("Administrative privileges required.");
  }
  return user;
}
```

---

## 4. Input Validation with Strict Zod Schemas

All external input from HTTP bodies, URL parameters, and Server Action arguments is validated through strict Zod schemas before reaching any domain service:

```typescript
export const AddScoreSchema = z.object({
  score: z.number().int().min(1, "Score must be at least 1").max(45, "Score cannot exceed 45"),
  playedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});

export const CharityPreferenceSchema = z.object({
  charityId: z.string().uuid("Invalid charity ID"),
  contributionPercentage: z.number().int().min(10, "Minimum contribution is 10%").max(100, "Maximum is 100%"),
});

export const PublishDrawSchema = z.object({
  drawId: z.string().uuid("Invalid draw ID"),
  mode: z.enum(['random', 'algorithmic']),
});

export const ReviewProofSchema = z.object({
  verificationId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(1000).optional(),
});
```

---

## 5. Security Audit Logging

All sensitive administrative, payment, and winner verification state changes write an immutable record to the `audit_logs` table:
- **Actor ID**: UUID of the authenticated user/admin performing the action
- **Action Type**: E.g. `DRAW_PUBLISHED`, `WINNER_PROOF_APPROVED`, `PAYOUT_MARKED_PAID`, `CHARITY_UPDATED`
- **Target Entity & ID**: The resource affected
- **Metadata**: JSON snapshot of previous state and new state
- **IP Address & User-Agent**: Network context for forensic audit
