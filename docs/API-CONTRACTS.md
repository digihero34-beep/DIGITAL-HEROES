# Digital Heroes — Server API Contracts & Action Interfaces

> **Document Type**: Exhaustive Server Actions & Route Handler Specifications  
> **Architecture Style**: Domain-Driven RPC over Next.js 15 Server Actions & Next.js API Routes  
> **Rule Compliance**: Architecture Standard Part 1 § 11 & Part 4 § 8  

---

## 1. API Architecture Overview

Digital Heroes exposes zero unrestricted REST CRUD tables to the client. All client-to-server operations are **domain-specific use case interactors** implemented via **Next.js Server Actions** for user commands and **Route Handlers** for webhook integrations and file streaming.

Every operation strictly follows this response envelope:
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```

---

## 2. Authentication & Profile Contracts

### 2.1 `signUpAction`
- **Purpose**: Registers a new user account and creates baseline profile.
- **Actor**: Public Visitor.
- **Authentication**: None required.
- **Authorization**: Public.
- **Input (Zod)**:
  ```typescript
  z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2).max(150),
    charityId: z.string().uuid().optional(),
    contributionPercentage: z.number().int().min(10).max(100).default(10),
  })
  ```
- **Output**: `{ success: true, data: { userId: string; email: string } }`
- **Errors**: `EMAIL_ALREADY_EXISTS`, `INVALID_PASSWORD`, `VALIDATION_FAILED`.
- **Database Interaction**: Creates row in `auth.users`; trigger provisions `public.profiles`. Saves initial charity preference if provided.
- **Rate Limit**: Max 5 requests per IP per hour.

### 2.2 `updateProfileAction`
- **Purpose**: Updates subscriber display details (name, avatar).
- **Actor**: Registered Subscriber.
- **Authentication**: Required (`requireAuth()`).
- **Authorization**: User can only modify their own profile (`auth.uid() = id`).
- **Input (Zod)**:
  ```typescript
  z.object({
    fullName: z.string().min(2).max(150).optional(),
    avatarUrl: z.string().url().optional(),
  })
  ```
- **Output**: `{ success: true, data: { profile: ProfileRecord } }`
- **Errors**: `UNAUTHORIZED`, `PROFILE_NOT_FOUND`.

---

## 3. Subscription & Billing Contracts

### 3.1 `createCheckoutSessionAction`
- **Purpose**: Generates a Stripe Checkout Session URL for subscription onboarding.
- **Actor**: Authenticated User.
- **Authentication**: Required.
- **Authorization**: Authenticated user without active subscription.
- **Input (Zod)**:
  ```typescript
  z.object({
    planId: z.enum(['plan_monthly', 'plan_yearly']),
  })
  ```
- **Output**: `{ success: true, data: { checkoutUrl: string } }`
- **Errors**: `UNAUTHORIZED`, `PLAN_NOT_FOUND`, `ALREADY_SUBSCRIBED`.
- **Database Interaction**: Reads Stripe Customer ID from `profiles` or creates one in Stripe.

### 3.2 `createBillingPortalSessionAction`
- **Purpose**: Generates a self-service Stripe Customer Portal session URL.
- **Actor**: Registered Subscriber.
- **Authentication**: Required.
- **Authorization**: Active or past-due subscriber.
- **Input**: None.
- **Output**: `{ success: true, data: { portalUrl: string } }`
- **Errors**: `UNAUTHORIZED`, `NO_BILLING_ACCOUNT`.

---

## 4. Golf Score Management Contracts

### 4.1 `addScoreAction`
- **Purpose**: Records a new Stableford golf score and enforces the rolling 5-score FIFO rule.
- **Actor**: Registered Subscriber.
- **Authentication**: Required (`requireAuth()`).
- **Authorization**: Active subscription required (`requireActiveSubscription()`).
- **Input (Zod)**:
  ```typescript
  z.object({
    score: z.number().int().min(1, "Score must be >= 1").max(45, "Score must be <= 45"),
    playedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  })
  ```
- **Output**: `{ success: true, data: { newScore: ScoreRecord; activeScores: ScoreRecord[]; replacedScoreId?: string } }`
- **Errors**: `DUPLICATE_DATE_ERROR` ("A score already exists for this date"), `INVALID_SCORE_RANGE`, `SUBSCRIPTION_INACTIVE`.
- **Database Interaction**: Inserts into `scores`. Database trigger deactivates scores beyond the latest 5.
- **Idempotency**: Unique constraint `(user_id, played_date)` prevents duplicate race conditions.

### 4.2 `updateScoreAction`
- **Purpose**: Edits an existing score value or date.
- **Actor**: Registered Subscriber.
- **Authentication**: Required.
- **Authorization**: Must own the score (`score.user_id === auth.uid()`).
- **Input (Zod)**:
  ```typescript
  z.object({
    scoreId: z.string().uuid(),
    score: z.number().int().min(1).max(45),
    playedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  ```
- **Output**: `{ success: true, data: { updatedScore: ScoreRecord } }`
- **Errors**: `SCORE_NOT_FOUND`, `UNAUTHORIZED`, `DUPLICATE_DATE_ERROR`.

### 4.3 `deleteScoreAction`
- **Purpose**: Removes a score entry.
- **Actor**: Registered Subscriber.
- **Authentication**: Required.
- **Authorization**: Must own the score.
- **Input (Zod)**: `{ scoreId: z.string().uuid() }`
- **Output**: `{ success: true, data: { deletedScoreId: string } }`
- **Errors**: `SCORE_NOT_FOUND`, `UNAUTHORIZED`.
- **Database Interaction**: Deletes row from `scores`. Triggers trigger/service to restore next available active score if available.

---

## 5. Charity & Donation Contracts

### 5.1 `updateCharityPreferenceAction`
- **Purpose**: Selects designated charity and sets contribution percentage.
- **Actor**: Registered Subscriber.
- **Authentication**: Required.
- **Authorization**: Scoped to user ID.
- **Input (Zod)**:
  ```typescript
  z.object({
    charityId: z.string().uuid(),
    contributionPercentage: z.number().int().min(10, "Minimum contribution is 10%").max(100),
  })
  ```
- **Output**: `{ success: true, data: { preference: CharityPreferenceRecord } }`
- **Errors**: `INVALID_PERCENTAGE`, `CHARITY_NOT_FOUND`, `UNAUTHORIZED`.
- **Database Interaction**: Upserts into `user_charity_preferences`.

### 5.2 `POST /api/donations/checkout` (Route Handler)
- **Purpose**: Direct one-off charity donation independent of subscription.
- **Actor**: Public Visitor or Subscriber.
- **Authentication**: Optional.
- **Input (JSON)**:
  ```typescript
  z.object({
    charityId: z.string().uuid(),
    amountCents: z.number().int().min(100, "Minimum donation is £1.00"),
    donorName: z.string().optional(),
    donorEmail: z.string().email(),
  })
  ```
- **Output**: `{ checkoutUrl: string }`
- **Database Interaction**: Creates pending record in `charity_donations`.

---

## 6. Draw Management & Simulation Contracts (Admin)

### 6.1 `runDrawSimulationAction`
- **Purpose**: Dry-runs a draw generation without publishing or creating permanent winner rows.
- **Actor**: Administrator.
- **Authentication**: Required (`requireAdmin()`).
- **Authorization**: Admin role only.
- **Input (Zod)**:
  ```typescript
  z.object({
    drawId: z.string().uuid(),
    mode: z.enum(['random', 'algorithmic']),
  })
  ```
- **Output**:
  ```typescript
  {
    success: true,
    data: {
      simulatedNumbers: number[];
      eligibleSubscribersCount: number;
      tier5WinnersCount: number;
      tier4WinnersCount: number;
      tier3WinnersCount: number;
      estimatedPrizePoolCents: number;
      tier5PrizePerWinnerCents: number;
      tier4PrizePerWinnerCents: number;
      tier3PrizePerWinnerCents: number;
    }
  }
  ```
- **Database Interaction**: Writes preview to `draw_simulations`.

### 6.2 `publishDrawAction`
- **Purpose**: Permanently executes draw, records winning numbers, creates winner rows, and calculates prize pools.
- **Actor**: Administrator.
- **Authentication**: Required (`requireAdmin()`).
- **Authorization**: Admin role only.
- **Input (Zod)**:
  ```typescript
  z.object({
    drawId: z.string().uuid(),
    mode: z.enum(['random', 'algorithmic']),
  })
  ```
- **Output**: `{ success: true, data: { publishedDraw: DrawRecord; winnersCreatedCount: number } }`
- **Errors**: `DRAW_ALREADY_PUBLISHED`, `INSUFFICIENT_PARTICIPANTS`, `UNAUTHORIZED_ADMIN`.
- **Database Interaction**: Executes inside an atomic SQL transaction:
  1. Updates `draws.status = 'published'`, sets `winning_numbers`.
  2. Creates rows in `prize_pools`.
  3. Bulk inserts winners into `winners`.
  4. Records action in `audit_logs`.

---

## 7. Winner Verification & Payout Contracts

### 7.1 `submitWinnerProofAction`
- **Purpose**: Winner submits screenshot proof of scores.
- **Actor**: Winning Subscriber.
- **Authentication**: Required.
- **Authorization**: Must be the winner on the record (`winner.user_id === auth.uid()`).
- **Input (FormData)**:
  - `winnerId`: string (UUID)
  - `file`: Binary file (`image/png`, `image/jpeg`, `application/pdf`, <= 10MB)
- **Output**: `{ success: true, data: { verificationId: string; status: 'submitted' } }`
- **Errors**: `NOT_A_WINNER`, `INVALID_FILE_TYPE`, `FILE_TOO_LARGE`, `ALREADY_VERIFIED`.
- **Database Interaction**: Uploads file to private storage bucket, inserts row into `winner_verifications`, updates `winners.verification_status = 'submitted'`.

### 7.2 `adminReviewProofAction`
- **Purpose**: Admin approves or rejects submitted proof.
- **Actor**: Administrator.
- **Authentication**: Required (`requireAdmin()`).
- **Input (Zod)**:
  ```typescript
  z.object({
    verificationId: z.string().uuid(),
    decision: z.enum(['approved', 'rejected']),
    notes: z.string().max(1000).optional(),
  })
  ```
- **Output**: `{ success: true, data: { status: 'approved' | 'rejected' } }`
- **Database Interaction**: Updates `winner_verifications`, sets `winners.verification_status`. If approved, inserts row into `payouts` with status `pending`. Logs to `audit_logs`.

### 7.3 `adminMarkPayoutPaidAction`
- **Purpose**: Records that a monetary prize was fulfilled to the winner.
- **Actor**: Administrator.
- **Authentication**: Required (`requireAdmin()`).
- **Input (Zod)**:
  ```typescript
  z.object({
    payoutId: z.string().uuid(),
    transactionReference: z.string().min(3).max(150),
  })
  ```
- **Output**: `{ success: true, data: { status: 'paid'; paidAt: string } }`
- **Errors**: `PAYOUT_NOT_FOUND`, `PAYOUT_NOT_APPROVED`, `ALREADY_PAID`.
- **Database Interaction**: Updates `payouts.status = 'paid'`, records `transaction_reference`, `paid_at`, `processed_by`. Logs to `audit_logs`.
