# Digital Heroes — Domain Logic & Calculation Engine Specifications

> **Document Type**: Pure Business Logic, Algorithms & Calculation Engines  
> **Rule Compliance**: Core Engineering Rule § 5 ("Business Logic Isolation") & Architecture Standard Part 1 § 7  
> **Design Pattern**: Pure Functions, Domain Calculators & Explicit State Machines  

---

## 1. Domain Logic Isolation Principle

All domain rules, calculation formulas, and state transitions exist as **pure, deterministic, independently testable TypeScript functions**. They contain zero UI dependencies, zero direct database calls, and zero external network calls. Side effects are orchestrated solely by the Application Layer.

---

## 2. Core Business Calculators & Algorithms

### 2.1 Golf Score Validation & Rolling 5-Score Algorithm

#### Function: `validateScoreEntry(score: number, playedDate: string): ValidationResult`
- **Inputs**:
  - `score`: integer
  - `playedDate`: ISO date string (`YYYY-MM-DD`)
- **Outputs**: `{ isValid: boolean; error?: string }`
- **Business Rules**:
  1. Score must be an integer: `Number.isInteger(score)`.
  2. Score must satisfy: `MIN_SCORE (1) <= score <= MAX_SCORE (45)`.
  3. Date must be a valid calendar date format `YYYY-MM-DD`.
  4. Date cannot be in the future: `playedDate <= todayUTC()`.
- **Test Cases**:
  - `score = 0` → Invalid ("Score must be between 1 and 45")
  - `score = 1` → Valid
  - `score = 45` → Valid
  - `score = 46` → Invalid ("Score must be between 1 and 45")
  - `score = 36.5` → Invalid ("Score must be a whole number")
  - `playedDate = 'tomorrow'` → Invalid ("Date cannot be in the future")

#### Function: `calculateRollingScores(existingScores: ScoreRecord[], newScore: ScoreRecord): ScoreSetResult`
- **Inputs**:
  - `existingScores`: array of existing active scores for the user (`ScoreRecord[]`)
  - `newScore`: incoming score object (`{ id, score, playedDate }`)
- **Outputs**:
  - `updatedActiveScores`: array of up to 5 active `ScoreRecord`s
  - `retiredScore`: optional `ScoreRecord` (the oldest active score replaced, if count exceeded 5)
- **Business Rules**:
  1. If an existing score has the exact same `playedDate`, throw `DuplicateDateError`.
  2. Append `newScore` to the list.
  3. Sort all records by `playedDate DESC`, with ties broken by `createdAt DESC`.
  4. The first 5 records are designated active. Any 6th record is designated retired/deactivated.
- **Idempotency & Concurrency**: Atomic execution inside database transaction with `UNIQUE(user_id, played_date)`.
- **Test Cases**:
  - User has 3 scores → Add 4th → User now has 4 active scores, 0 retired.
  - User has 5 scores → Add 6th (newer date) → Oldest 5th score is retired, new score is active.
  - User has 5 scores → Add score with identical date → Rejects with DuplicateDateError.

---

### 2.2 Draw Generation Engines (PRD § 06)

#### Function: `generateRandomDraw(rangeMin = 1, rangeMax = 45, count = 5): number[]`
- **Inputs**: Number range (1..45), count (5).
- **Outputs**: Array of 5 unique integers, sorted ascending.
- **Algorithm**:
  - Utilizes cryptographically secure random number generation (`crypto.getRandomValues`).
  - Sampling without replacement from the pool $\{1, 2, \dots, 45\}$ via Fisher-Yates shuffle.
- **Business Rule**: Must be uniform; every integer has equal probability $P = 1/45$.
- **Test Cases**: Exactly 5 numbers; all numbers between 1 and 45; zero duplicate values.

#### Function: `generateAlgorithmicDraw(scoreFrequencies: Map<number, number>, count = 5, smoothing = 1): number[]`
- **Inputs**:
  - `scoreFrequencies`: Map of each number $1..45$ to its frequency across all active player scores.
  - `count`: 5 numbers to select.
  - `smoothing`: Laplace smoothing constant (default: 1) ensuring unpicked numbers retain non-zero probability.
- **Outputs**: Array of 5 unique integers, sorted ascending.
- **Algorithm**:
  1. For each integer $i \in [1, 45]$, weight $W_i = \text{frequency}(i) + \text{smoothing}$.
  2. Probability $P_i = W_i / \sum_{j} W_j$.
  3. Iteratively sample 5 distinct numbers without replacement using cumulative probability distribution.
- **Business Rule**: Numbers with higher submission frequencies across active subscribers have proportionally higher odds of selection.
- **Test Cases**:
  - All numbers have 0 frequency → behaves identical to uniform random draw.
  - Number 36 has 10,000 occurrences vs 0 for others → 36 is selected with near-certainty.

---

### 2.3 Score-to-Draw Matching Engine (PRD § 06)

#### Function: `matchUserScores(userScores: number[], winningNumbers: number[]): MatchResult`
- **Inputs**:
  - `userScores`: Array of active scores for subscriber (up to 5 integers in 1..45).
  - `winningNumbers`: Array of 5 distinct drawn numbers (integers in 1..45).
- **Outputs**:
  - `matchedCount`: integer (0..5)
  - `matchedNumbers`: array of integers matching the draw
  - `tier`: `MATCH_5` | `MATCH_4` | `MATCH_3` | `NO_MATCH`
- **Algorithm**:
  - Computes the mathematical set intersection:
    $$\text{Matches} = \text{Unique}(\text{userScores}) \cap \text{Set}(\text{winningNumbers})$$
  - `matchedCount = Matches.length`
- **Tier Assignment**:
  - 5 matches → `MATCH_5`
  - 4 matches → `MATCH_4`
  - 3 matches → `MATCH_3`
  - < 3 matches → `NO_MATCH`
- **Test Cases**:
  - Scores: `[10, 20, 30, 40, 45]`, Draw: `[10, 20, 30, 40, 45]` → 5 matches (`MATCH_5`)
  - Scores: `[10, 20, 30, 40, 1]`, Draw: `[10, 20, 30, 40, 45]` → 4 matches (`MATCH_4`)
  - Scores: `[10, 20, 30, 2, 3]`, Draw: `[10, 20, 30, 40, 45]` → 3 matches (`MATCH_3`)
  - Scores: `[10, 20, 1, 2, 3]`, Draw: `[10, 20, 30, 40, 45]` → 2 matches (`NO_MATCH`)
  - Scores with duplicate values: `[36, 36, 36, 38, 40]`, Draw: `[36, 12, 14, 18, 22]` → Exactly **1 match**, not 3.

---

### 2.4 Prize Pool Allocation & Rollover Engine (PRD § 07)

#### Function: `calculatePrizePoolAllocation(activeSubscribers: number, subscriptionFeeCents: number, poolFundingPercentage: number, rolloverInCents: number): PoolAllocation`
- **Inputs**:
  - `activeSubscribers`: count of eligible active subscribers
  - `subscriptionFeeCents`: e.g. 2000 (£20.00)
  - `poolFundingPercentage`: e.g. 50%
  - `rolloverInCents`: jackpot carried over from previous draw (cents)
- **Formulas**:
  - $\text{TotalRevenue} = \text{activeSubscribers} \times \text{subscriptionFeeCents}$
  - $\text{BasePool} = \lfloor \text{TotalRevenue} \times (\text{poolFundingPercentage} / 100) \rfloor$
  - $\text{Tier5Base} = \lfloor \text{BasePool} \times 0.40 \rfloor$
  - $\text{Tier5Total} = \text{Tier5Base} + \text{rolloverInCents}$ (Rollover jackpot)
  - $\text{Tier4Total} = \lfloor \text{BasePool} \times 0.35 \rfloor$
  - $\text{Tier3Total} = \lfloor \text{BasePool} \times 0.25 \rfloor$
  - Discrepancy cents from flooring added to Tier 3 to guarantee exact penny sum: $\text{BasePool} - (\text{Tier5Base} + \text{Tier4Total} + \text{Tier3Total})$.
- **Test Cases**:
  - 1,000 subscribers @ £20.00, 50% funding, £5,000 rollover:
    - Base pool = £10,000.00
    - Tier 5 pool = £4,000.00 + £5,000.00 = £9,000.00
    - Tier 4 pool = £3,500.00
    - Tier 3 pool = £2,500.00

#### Function: `splitTierPrizePool(tierPoolCents: number, winnerCount: number): number[]`
- **Inputs**: Tier pool in cents, number of winning subscribers in that tier.
- **Outputs**: Array of length `winnerCount`, where each element is the prize in cents for that winner.
- **Business Rule (PRD § 07)**: "Prizes split equally among multiple winners in the same tier".
- **Integer Math Precision**:
  - `basePrize = Math.floor(tierPoolCents / winnerCount)`
  - `remainder = tierPoolCents % winnerCount`
  - Winners $0$ to $R-1$ receive `basePrize + 1`; remaining receive `basePrize`.
  - Sum of all winner prizes identically equals `tierPoolCents`.
- **Test Cases**:
  - £100.00 (10,000 cents) split among 3 winners:
    - Winner 1: 3,334 cents (£33.34)
    - Winner 2: 3,333 cents (£33.33)
    - Winner 3: 3,333 cents (£33.33)
    - Total sum = 10,000 cents (£100.00). Zero penny loss.

---

### 2.5 Charity Allocation Engine (PRD § 08.1)

#### Function: `calculateCharityContribution(subscriptionFeeCents: number, contributionPercentage: number): CharityContributionResult`
- **Inputs**:
  - `subscriptionFeeCents`: integer cents (e.g. 2000)
  - `contributionPercentage`: integer between 10 and 100
- **Validation**:
  - `if (contributionPercentage < 10) throw new InvalidCharityPercentageError("Minimum contribution is 10%")`
  - `if (contributionPercentage > 100) throw new InvalidCharityPercentageError("Maximum contribution is 100%")`
- **Formulas**:
  - $\text{charityAmountCents} = \lfloor \text{subscriptionFeeCents} \times (\text{contributionPercentage} / 100) \rfloor$
- **Test Cases**:
  - £20.00 subscription @ 10% → £2.00 charity allocation.
  - £20.00 subscription @ 25% → £5.00 charity allocation.
  - Contribution @ 9% → Rejects with validation error.

---

## 3. Explicit State Machines

### 3.1 Winner Verification State Machine (PRD § 09)

```
[ pending_proof ]
       │ User uploads valid screenshot
       ▼
  [ submitted ]
       │ Admin starts inspection
       ▼
 [ under_review ]
       │
   ┌───┴────────────────────────┐
   │ Admin Approves             │ Admin Rejects (with reason)
   ▼                            ▼
[ approved ]               [ rejected ]
   │
   ▼
Triggers Payout Creation
```

- **Valid Transitions**:
  - `pending_proof` → `submitted` (Actor: Winning Subscriber)
  - `submitted` → `under_review` (Actor: Administrator)
  - `under_review` → `approved` (Actor: Administrator)
  - `under_review` → `rejected` (Actor: Administrator)
  - `rejected` → `submitted` (Actor: Winning Subscriber re-submitting valid proof)
- **Forbidden Transitions**:
  - Direct transition from `pending_proof` to `approved` (Forbidden: proof screenshot mandatory).
  - Client triggering transition to `approved` (Forbidden: strictly Admin authorized).

---

### 3.2 Payout State Machine (PRD § 09: Pending → Paid)

```
[ pending ] ──► [ processing ] ──► [ paid ]
     │
     └──► [ failed ] ──► [ pending ] (retry)
```

- **Valid Transitions**:
  - `pending` → `processing` (Actor: System / Admin)
  - `processing` → `paid` (Actor: Admin with transaction reference)
  - `processing` → `failed` (Actor: System on bank failure)
  - `failed` → `pending` (Actor: Admin retry)
- **Guards**:
  - Payout can only transition to `paid` if associated `winner.verification_status === 'approved'`.
  - Payout mutation requires `transaction_reference` non-null.
