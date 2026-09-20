# Digital Heroes — Database Security & Data Isolation Architecture

> **Document Type**: Database Security, Row-Level Security (RLS) & Access Control Specification  
> **Target Database**: Supabase PostgreSQL 15+  
> **Rule Compliance**: Security Rules, Architecture Standard Part 2 § 1–4, Database Standard Part 2 § 5–6  

---

## 1. Security Philosophy & Threat Model

The Digital Heroes platform stores financial data, score cards, winner payouts, and personal identity records. The database security architecture enforces **defense-in-depth**:
1. **Row-Level Security (RLS)** is enabled on all tables in the `public` schema.
2. Even if an attacker compromises a frontend API route or acquires an authenticated subscriber JWT, the database engine itself rejects unauthorized queries.
3. The application operates with two PostgreSQL roles:
   - `authenticated`: Bound to the end-user's JWT (`auth.uid()`). Strictly isolated to their own records.
   - `service_role`: Bypasses RLS for trusted background tasks (e.g. Stripe webhook handler, scheduled draw execution), accessible **only** within server-side Node.js code and never exposed to the client.

---

## 2. Row-Level Security (RLS) Policies by Table

### 2.1 Table: `profiles`
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update non-privileged fields on their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins have full read/write access to all profiles
CREATE POLICY "Admins have full access to profiles"
ON profiles FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

### 2.2 Table: `subscriptions`
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscribers can view only their own subscription details
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Mutations are performed exclusively via server service_role
```

---

### 2.3 Table: `scores`
```sql
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Subscribers can view only their own scores
CREATE POLICY "Users can view own scores"
ON scores FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Subscribers can insert their own scores
CREATE POLICY "Users can insert own scores"
ON scores FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Subscribers can update their own scores
CREATE POLICY "Users can update own scores"
ON scores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Subscribers can delete their own scores
CREATE POLICY "Users can delete own scores"
ON scores FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all scores for audit/support
CREATE POLICY "Admins have full access to scores"
ON scores FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

### 2.4 Table: `draws` & `prize_pools`
```sql
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pools ENABLE ROW LEVEL SECURITY;

-- Anyone (public and authenticated) can view published draws
CREATE POLICY "Public can view published draws"
ON draws FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admins can view all draws (including draft and simulated)
CREATE POLICY "Admins can view all draws"
ON draws FOR SELECT
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can create/modify draws
CREATE POLICY "Admins can modify draws"
ON draws FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Prize pools: Public can view for published draws
CREATE POLICY "Public can view prize pools for published draws"
ON prize_pools FOR SELECT
TO anon, authenticated
USING (EXISTS (SELECT 1 FROM draws WHERE draws.id = prize_pools.draw_id AND draws.status = 'published'));

-- Prize pools: Admins have full access
CREATE POLICY "Admins can view and manage prize pools"
ON prize_pools FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

### 2.5 Table: `charities` & `user_charity_preferences`
```sql
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charity_preferences ENABLE ROW LEVEL SECURITY;

-- Public can view active charities
CREATE POLICY "Public can view active charities"
ON charities FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admins have full control over charities
CREATE POLICY "Admins can manage charities"
ON charities FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Users can view and manage their own charity preferences
CREATE POLICY "Users manage own charity preference"
ON user_charity_preferences FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### 2.6 Table: `winners`, `winner_verifications`, & `payouts`
```sql
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own winner records
CREATE POLICY "Users can view own winnings"
ON winners FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can view and upload their own winner verifications
CREATE POLICY "Users view own verifications"
ON winner_verifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own verifications"
ON winner_verifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own payouts
CREATE POLICY "Users view own payouts"
ON payouts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins have full management access over winners, verifications, and payouts
CREATE POLICY "Admins manage all winners"
ON winners FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins manage all verifications"
ON winner_verifications FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins manage all payouts"
ON payouts FOR ALL
TO authenticated
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## 3. Storage Bucket Security (`winner-proofs`)

Uploaded proof files are protected at the object storage layer:

1. **Bucket Configuration**: `winner-proofs` bucket is configured with `public = false`.
2. **Path Schema**: Files are saved with user-prefixed paths: `{user_id}/{winner_id}/{random_uuid}.{ext}`.
3. **Storage RLS Policies**:
   - `SELECT`: Only the user whose UUID matches the root folder, or users with the `admin` role in `public.profiles`.
   - `INSERT`: Authenticated users can only insert files into `{auth.uid()}/*` if they have a matching unverified record in `public.winners`.
   - `DELETE` / `UPDATE`: Denied to standard users; only accessible via admin or service role.
4. **Access URLs**: The frontend never receives raw persistent public URLs. Files are rendered via short-lived pre-signed URLs (TTL: 15 minutes).

---

## 4. Conceptual Security Attack Matrix & Defenses

| Threat Scenario | Attack Vector | Security Defense | Outcome |
| :--- | :--- | :--- | :--- |
| **IDOR: User A reads User B's scores** | Attacker queries `/api/scores?userId=B` or executes Supabase client call | `auth.uid() = user_id` in RLS + Server Action ownership guard | Returns empty result / 403 Forbidden |
| **Privilege Escalation to Admin** | Attacker sends `role: 'admin'` in profile update payload | Database policy prevents `role` mutation; Server Action ignores `role` input | Update rejected / role unchanged |
| **Draft Draw Leak** | Attacker queries `draws` table before publication date | RLS policy restricts public/subscribers to `status = 'published'` | Draft/simulated draws completely invisible |
| **Unauthorized Proof Upload** | Non-winning user attempts to POST a screenshot to `winner_verifications` | Foreign key to `winners` + RLS check + Server Action validation | Insert rejected with constraint violation |
| **Direct Payout Marking** | Client attempts to POST `status: 'paid'` to `/api/payouts` | Table permissions restrict `UPDATE` on `payouts` strictly to admins | Mutation rejected with 403 Forbidden |
| **Unauthenticated API Access** | Anonymous user hits score or subscription endpoints | Next.js Middleware blocks request; Supabase rejects anonymous JWT | 401 Unauthorized redirect to `/login` |
| **SQL Injection** | Malicious input in search or score fields | Parameterized queries via Supabase client / PostgreSQL prepared statements | Zero SQL injection vector |
| **Webhook Forgery** | Attacker sends fake `checkout.session.completed` HTTP POST | `stripe.webhooks.constructEvent()` with cryptographic HMAC signature verification | Request rejected with 400 Bad Signature |
