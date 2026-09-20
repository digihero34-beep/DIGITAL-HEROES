# Digital Heroes — Ambiguity Audit & Provisional Assumptions

> **Document Type**: Exhaustive Ambiguity Audit & Technical Assumptions Register  
> **Source of Truth**: Digital Heroes PRD (Level 1), Version 1.0  
> **Rule Compliance**: Master Rule § 1 & § 2; PRD Compliance Rule § Important  

---

## 1. Ambiguity Audit Framework

In compliance with the Core Engineering Rules, **no business rule may be silently invented**. When the PRD is silent, incomplete, or contains multiple reasonable interpretations, the ambiguity must be formally cataloged with:
- Context & Question
- Feasible Interpretations
- Selected Provisional Implementation Assumption
- Technical, UX, and Testing Impact
- Risk Assessment and Clarification Need

---

## 2. Exhaustive Register of Assumptions

### ASM-01: Draw Number Range & Generation Mechanics
- **PRD Reference**: § 05 ("Score range: 1–45"), § 06 ("5-number match, 4-number match, 3-number match", "Random — standard lottery-style").
- **The Question**: What is the universe of numbers drawn in a monthly draw, and are the 5 drawn numbers distinct?
- **Why Ambiguous**: The PRD defines scores as 1–45 and match tiers as 5, 4, and 3 numbers, but does not explicitly declare the pool size from which winning numbers are selected or whether replacement is allowed.
- **Possible Interpretations**:
  1. *Draw 5 distinct integers uniformly from {1, 2, ..., 45}* (standard lottery format, matching the 1–45 score range).
  2. *Draw 5 integers with replacement (allowing duplicates)*.
  3. *Draw from an arbitrary range (e.g. 1–50 or 1–99)*.
- **Selected Provisional Interpretation**: **Interpretation 1: Exactly 5 unique (distinct) integers are drawn from the closed range [1, 45]**.
- **Reason**: Stableford golf scores on the platform are constrained to [1, 45]. Standard lottery mechanisms pick distinct balls from a physical or virtual hopper. Generating 5 distinct numbers within [1, 45] creates an exact 1:1 mathematical domain alignment with user score entries.
- **Technical Impact**: Draw generation selects `k=5` without replacement from `n=45`. The database enforces `CHECK (array_length(numbers, 1) = 5)` and uniqueness of array elements.
- **UX Impact**: Clean, intuitive lottery ball display showing 5 unique numbered balls.
- **Testing Impact**: Unit tests verify drawn numbers are always unique, sorted ascending, and strictly within 1..45.
- **Risk**: Low. Highly standard for lottery architectures.
- **Clarification Recommended**: No, standard lottery practice.

---

### ASM-02: Score-to-Draw Matching Logic with Duplicate User Scores
- **PRD Reference**: § 05 ("Users must enter their last 5 golf scores"), § 06 ("5-number match, 4-number match, 3-number match").
- **The Question**: If a subscriber has entered duplicate score values across their 5 active scores (e.g. scored 36 on Monday and 36 on Friday), how does matching against 5 distinct drawn numbers operate?
- **Why Ambiguous**: While scores have unique dates, two rounds can legitimately produce identical Stableford scores (e.g. {32, 36, 36, 38, 40}). If 36 is drawn, does it match once or twice?
- **Possible Interpretations**:
  1. *Set Intersection Matching (Unordered Unique)*: Count distinct user score values that exist in the drawn set: `count(set(user_scores) ∩ set(drawn_numbers))`.
  2. *Multiset / Positional Matching*: Allow a drawn number to match multiple duplicate user scores.
- **Selected Provisional Interpretation**: **Interpretation 1: Set Intersection Matching**. A user matches a drawn number at most once. The match count is the size of the intersection between the unique set of active user scores and the set of 5 drawn winning numbers.
- **Reason**: If 36 is drawn once, it represents one winning number. Having two scores of 36 should not artificially confer two matches for a single drawn number; otherwise, a user could manipulate odds by entering repeated common scores.
- **Technical Impact**: Matching logic does `set(user_scores) & set(drawn_numbers)`. Match count is strictly an integer in [0, 5].
- **UX Impact**: UI clearly highlights each matched number on the user's scorecard and the winning draw display.
- **Testing Impact**: Explicit test case: User scores [36, 36, 36, 40, 42] vs Draw [36, 12, 15, 20, 25] produces exactly **1 match**, not 3.
- **Risk**: Medium. Essential for game integrity.
- **Clarification Recommended**: Recommend documenting in platform terms of service.

---

### ASM-03: Algorithmic Draw Weighting Formula
- **PRD Reference**: § 06 ("Algorithmic — weighted by score frequency").
- **The Question**: How is "weighted by score frequency" mathematically defined?
- **Why Ambiguous**: "Weighted by score frequency" could mean more frequently submitted scores have higher odds of being drawn, or conversely, inverse frequency (fewer winners), or historical distribution across seasons.
- **Possible Interpretations**:
  1. *Direct Empirical Frequency Weighting*: Each integer $x \in [1, 45]$ is assigned a sampling probability proportional to its frequency of occurrence across all active subscribers' current 5-score sets: $P(x) \propto \text{count}(x) + \epsilon$ (where $\epsilon = 1$ Laplace smoothing ensures unpicked numbers maintain non-zero probability).
  2. *Inverse Frequency Weighting*: Numbers submitted less often have higher probability to minimize payouts.
  3. *Gaussian distribution around average golf score (e.g. 36)*.
- **Selected Provisional Interpretation**: **Interpretation 1: Direct Empirical Frequency with Laplace (+1) Smoothing**. The probability of ball $x$ being selected is $(F_x + 1) / \sum_{i=1}^{45} (F_i + 1)$, sampled without replacement for 5 numbers.
- **Reason**: Directly honors the literal PRD phrasing ("weighted by score frequency") and rewards platform-wide scoring trends while ensuring mathematical safety through Laplace smoothing (preventing zero-probability division).
- **Technical Impact**: An analytical aggregation query computes frequencies from `scores WHERE is_active = true`. A weighted sampling algorithm without replacement picks 5 numbers.
- **UX Impact**: Admin console visualizes the frequency histogram and resulting weights before simulation.
- **Testing Impact**: Unit tests verify that a heavily skewed input distribution produces higher empirical draw rates for high-frequency scores.
- **Risk**: Medium. Requires reproducible seeded simulation.
- **Clarification Recommended**: Yes, business confirmation of smoothing factor.

---

### ASM-04: Fixed Portion of Subscription Fee Allocated to Prize Pool
- **PRD Reference**: § 07 ("A fixed portion of each subscription contributes to the prize pool. Distribution is pre-defined and enforced automatically.").
- **The Question**: What exact percentage or fixed monetary portion of the subscription fee is allocated to the prize pool?
- **Why Ambiguous**: The PRD specifies that 10% minimum goes to Charity (§ 08.1), and defines the internal split of the prize pool (40% Tier 5, 35% Tier 4, 25% Tier 3), but leaves the exact fraction of the subscription fee that funds the pool unspecified.
- **Possible Interpretations**:
  1. *50% of the Net Subscription Fee* funds the prize pool (e.g., 10% Charity, 50% Prize Pool, 40% Platform Operations/Margin).
  2. *Fixed nominal currency amount* (e.g. £5.00 per monthly subscriber).
  3. *Configurable Platform Parameter* with a default of 40% or 50%.
- **Selected Provisional Interpretation**: **Interpretation 3: Configurable Platform Parameter defaulting to 50% of subscription revenue**.
- **Reason**: Allows the platform to remain economically viable (10% Charity + 50% Prize Pool + 40% Gross Margin) while keeping the exact allocation configurable in `system_settings` or draw configuration.
- **Technical Impact**: Prize pool calculation function takes `pool_funding_percentage` (default 50) as an audited parameter.
- **UX Impact**: Transparent prize pool counter explains: "£X contributed per active subscriber this month".
- **Testing Impact**: Tests run with varying pool funding percentages (e.g. 30%, 50%).
- **Risk**: Low. Easily adjusted via administrative settings.
- **Clarification Recommended**: Yes, business to confirm default pool contribution percentage.

---

### ASM-05: Annual Subscription Contribution to Monthly Draws
- **PRD Reference**: § 04 ("Monthly plan and yearly plan (discounted rate)"), § 06 ("Monthly cadence").
- **The Question**: How does an annual subscriber contribute to monthly prize pools and charities across 12 monthly draws?
- **Why Ambiguous**: Annual subscriptions charge upfront once per year, whereas draws operate on a monthly cadence.
- **Possible Interpretations**:
  1. *Amortized 1/12th Monthly Recognition*: An annual fee is amortized evenly across the 12 draw cycles of the subscription year.
  2. *Single Month Recognition*: The entire annual fee contributes only to the draw cycle in which payment occurred.
- **Selected Provisional Interpretation**: **Interpretation 1: Amortized 1/12th Recognition per Draw Cycle**.
- **Reason**: Fulfills the principle that every active subscriber participates in every monthly draw during their active subscription term, contributing their fair 1/12th share each month.
- **Technical Impact**: Active subscriber count and revenue pool include annual subscribers at `annual_amount_cents / 12`.
- **UX Impact**: Annual subscribers see consistent draw entry across all 12 months without interruption.
- **Testing Impact**: Tests confirm active pool includes monthly subscribers + 1/12th of annual subscribers.
- **Risk**: Low. Standard SaaS accounting and gaming compliance practice.
- **Clarification Recommended**: No.

---

### ASM-06: Historical Score Retention vs 5-Score Rolling FIFO Rule
- **PRD Reference**: § 05 ("Only the latest 5 scores are retained at any time. A new score replaces the oldest stored score automatically.").
- **The Question**: Does the database physically execute a hard `DELETE` of the 6th score, or does it mark it `is_active = false` (soft archive) to preserve audit trails for winner verification?
- **Why Ambiguous**: § 05 states "Only the latest 5 scores are retained at any time". However, § 09 (Winner Verification) requires admins to review screenshots against entered scores. If an older score was entered, participated in a draw, and is physically deleted before verification, the audit trail would be destroyed.
- **Possible Interpretations**:
  1. *Physical DELETE*: Database hard deletes records beyond 5.
  2. *Audited Soft-Deactivation*: Database maintains `is_active BOOLEAN`. Exactly 5 records per user have `is_active = true` (enforced by trigger/service). Inactive scores are preserved in historical audit log for compliance.
- **Selected Provisional Interpretation**: **Interpretation 2: Audited Active Flag (`is_active = true` limited to 5 records)**.
- **Reason**: Preserves regulatory integrity, data history, and winner audit trails while presenting the user with strictly and exclusively their latest 5 scores across all user-facing queries.
- **Technical Impact**: Queries for user scoring and draw matching filter strictly on `is_active = true`. A database function / service updates the oldest active score to `is_active = false` when a new score is added.
- **UX Impact**: UI strictly renders the 5 active scores. To the user, only 5 scores exist.
- **Testing Impact**: Tests verify: (1) UI returns exactly 5 scores; (2) total count of active scores for a user never exceeds 5; (3) historical verification records maintain snapshot references.
- **Risk**: Low. Complies with both § 05 and Database Industrial Standard Part 2 § 2.
- **Clarification Recommended**: No.

---

### ASM-07: Unclaimed 4-Number and 3-Number Prize Allocations
- **PRD Reference**: § 07 ("Rollover? 5-Number match: Yes — jackpot; 4-Number match: No; 3-Number match: No").
- **The Question**: If a monthly draw has zero winners in Tier 4 (35%) or Tier 3 (25%), what happens to those funds?
- **Why Ambiguous**: The PRD explicitly forbids rollover for Tier 4 and Tier 3 ("No"), but does not specify whether unclaimed tier funds revert to the platform treasury, roll into the charity pot, or carry into Tier 5 jackpot.
- **Possible Interpretations**:
  1. *Platform Reserve*: Retained in platform reserve / contingency fund.
  2. *Added to Charity Pool*: Distributed to charities as an extra bonus donation.
  3. *Rolled into Tier 5 Jackpot*: Added to the rollover jackpot.
- **Selected Provisional Interpretation**: **Interpretation 1: Retained in Platform Escrow / Operational Reserve** (with transparent reporting in Admin Analytics).
- **Reason**: Strict PRD compliance: Tier 4 and 3 explicitly state `Rollover? No`. Reallocating to jackpot would violate the `No` constraint. Retaining in platform reserve maintains liquidity.
- **Technical Impact**: `prize_pools` table stores `tier_4_unclaimed_cents` and `tier_3_unclaimed_cents`.
- **UX Impact**: Results show "No winners in Tier 4; prize reserved".
- **Testing Impact**: Test draw with 0 Tier 4 winners: verify tier 4 funds are marked unclaimed and not added to `rollover_out_cents`.
- **Risk**: Medium.
- **Clarification Recommended**: Yes, clarify business intent for unclaimed Tier 4/3 funds.

---

### ASM-08: Missing Page 11 of PRD Document (§ 13 Technical & § 14 Scalability)
- **PRD Reference**: Page 2 Table of Contents lists "§ 13 Technical requirements 11" and "§ 14 Scalability considerations 11". The PDF file has 13 total pages, and jumps from Page 10 (10 / 14) to Page 11 (labeled 12 / 14).
- **The Question**: What specific technical requirements and scalability considerations were intended on the omitted Page 11?
- **Why Ambiguous**: The physical page is absent from the PDF distribution.
- **Selected Provisional Interpretation**: Derive all technical and scalability requirements directly from:
  1. § 15 Mandatory Deliverables (Vercel deployment, Supabase PostgreSQL backend, Stripe payment gateway, clean structured codebase).
  2. Architecture Industrial Standard Parts 1–4.
  3. Database Industrial Standard Parts 1–3.
- **Reason**: Guarantees zero unverified assumptions while enforcing the most rigorous staff-level software engineering and scalability standards possible.
- **Technical Impact**: Covered in detail in `docs/ARCHITECTURE.md` and `docs/DATABASE-DESIGN.md`.
- **Risk**: Low. Standard web engineering stack.
- **Clarification Recommended**: Noted in Gap Analysis.

---

### ASM-09: Proof Upload File Types and Size Restrictions
- **PRD Reference**: § 09 ("Screenshot of scores from the golf platform").
- **The Question**: What file formats and size constraints apply to winner proof uploads?
- **Why Ambiguous**: The PRD specifies "Screenshot of scores", but does not specify acceptable MIME types, resolution, or maximum payload size.
- **Selected Provisional Interpretation**: Accept MIME types `image/png`, `image/jpeg`, `image/webp`, and `application/pdf` up to a maximum file size of **10 MB**.
- **Reason**: Screenshots from golf handicap apps (e.g. Golfshot, GHIN, HowDidiDo) are overwhelmingly PNG or JPEG images, or exported PDF scorecards. 10 MB comfortably accommodates high-resolution mobile screenshots while preventing denial-of-service payload attacks.
- **Technical Impact**: Server-side magic byte and MIME validation; client-side file picker constraint; storage in private Supabase bucket.
- **UX Impact**: Drag-and-drop file uploader with preview for images and PDF indicator.
- **Testing Impact**: Upload tests for valid PNG, valid JPEG, valid PDF, oversized file (11MB -> rejected), malicious extension (`.exe` -> rejected).
- **Risk**: Low. Standard security hygiene.
- **Clarification Recommended**: No.

---

### ASM-10: Multi-Winner Prize Split Remainder (Rounding)
- **PRD Reference**: § 07 ("Prizes split equally among multiple winners in the same tier").
- **The Question**: When a tier prize pool in cents cannot be divided evenly among $N$ winners (e.g., £100.00 / 3 winners = 3333.333... pence), how is the remainder penny allocated?
- **Why Ambiguous**: Financial integrity rules forbid floating-point calculations and forbid creating or destroying money.
- **Possible Interpretations**:
  1. *Floor Division with Remainder to First Winner(s)*: Base prize is `floor(pool / N)`. The `remainder = pool % N` pennies are distributed one-by-one to winners sorted by submission time or user ID.
  2. *Floor Division with Remainder Retained by Platform*: Each winner gets `floor(pool / N)`; remainder stays in pool.
- **Selected Provisional Interpretation**: **Interpretation 1: Exact integer penny preservation**. Each winner receives $\lfloor \text{Pool} / N \rfloor$, and the remainder $R = \text{Pool} \pmod N$ is allocated 1 penny each to the first $R$ winners in deterministic order. Total paid out identically equals the tier pool.
- **Reason**: Completely deterministic, zero money created or lost, mathematically exact, and prevents accounting discrepancies.
- **Technical Impact**: Pure helper function `splitPrizePool(poolCents, winnerCount)`.
- **UX Impact**: Each winner receives exact currency display (e.g. £33.34 and £33.33).
- **Testing Impact**: Unit test for £100.00 divided by 3: `[3334, 3333, 3333]`. Sum equals 10000 cents exactly.
- **Risk**: Low.
- **Clarification Recommended**: No.
