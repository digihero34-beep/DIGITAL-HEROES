---
trigger: always_on
---

# Digital Heroes PRD Compliance

The Digital Heroes PRD is the product source of truth.

Before implementing any feature, locate the relevant PRD requirement.

The platform contains:

1. Public visitor
2. Registered subscriber
3. Administrator

Respect these role boundaries.

## SUBSCRIPTION

Implement:

- Monthly plan
- Yearly plan
- Payment gateway integration
- Restricted access for non-subscribers
- Renewal
- Cancellation
- Lapsed subscription states
- Server-side subscription validation

Do not trust client-side subscription state.

## SCORE MANAGEMENT

Users must:

- Enter golf scores in Stableford format
- Enter scores from 1–45
- Provide a date
- Maintain only the latest 5 scores

Rules:

- Only one score per date
- Existing score may be edited/deleted
- New score replaces the oldest stored score when appropriate
- Display scores newest first

Write tests specifically for:
- 0
- 1
- 45
- 46
- duplicate date
- editing
- deleting
- sixth score
- equal dates
- invalid dates

## DRAW SYSTEM

Support:

- 5-number match
- 4-number match
- 3-number match
- Random draw
- Algorithmic draw
- Monthly cadence
- Admin-controlled publishing
- Simulation
- Jackpot rollover
- Multiple winners

Never implement draw logic directly inside a UI component.

Create a deterministic and testable draw engine.

Every published draw must have an immutable result/history.

## PRIZE POOL

The PRD specifies:

5-number match:
40%

4-number match:
35%

3-number match:
25%

5-number jackpot:
rolls over if unclaimed

Multiple winners:
split the relevant prize tier equally.

Prize calculations must be server-side and deterministic.

Do not use floating-point arithmetic for money.

## CHARITY

Implement:

- Charity selection
- Minimum 10% contribution
- Optional higher contribution
- Independent donation option
- Charity directory
- Search/filter
- Charity profiles
- Images
- Upcoming events
- Featured charity

Validate contribution percentages server-side.

## WINNER VERIFICATION

Winner flow:

Eligible winner
→ proof upload
→ admin review
→ approve/reject
→ payment state
→ paid

Support:

Pending
Paid

Do not allow the client to mark itself as paid.

## USER DASHBOARD

Must expose:

- Subscription status
- Renewal date
- Score management
- Selected charity
- Contribution percentage
- Draw participation
- Upcoming draws
- Total winnings
- Payment status

## ADMIN DASHBOARD

Must support:

- User management
- Score management
- Subscription management
- Draw configuration
- Draw simulation
- Draw publication
- Charity management
- Charity media/content management
- Winner verification
- Payout completion
- Reports
- Analytics

Admin authorization must be server-side.

## UI/UX

The product must NOT look like a traditional golf website.

Avoid:

- Golf clichés
- Fairways as the dominant visual language
- Plaid
- Traditional golf-club aesthetics

Prioritize:

- Charity impact
- Emotional engagement
- Clean modern interface
- Motion
- Micro-interactions
- Clear explanation of how the platform works
- Clear explanation of winning
- Strong subscription CTA

Mobile and desktop must both work.

## IMPORTANT

The PRD intentionally contains ambiguity.

Do not silently invent business rules.

Create:

docs/ASSUMPTIONS.md

for unresolved decisions.

Each assumption must contain:

- Question
- PRD reference
- Options considered
- Selected implementation
- Reason
- Impact