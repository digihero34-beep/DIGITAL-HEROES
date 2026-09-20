# DIGITAL HEROES — PREMIUM PRODUCT DESIGN DIRECTIVE
# PART 2 — INFORMATION ARCHITECTURE, PRODUCT FLOWS & EXPERIENCE DEPTH

IMPORTANT: Read Part 1 before Part 2. Treat Parts 1–7 as one continuous instruction. The PRD remains the source of truth.

## 31. INFORMATION ARCHITECTURE
Create a clear information architecture for three audiences: public visitor, subscriber, and administrator.

PUBLIC:
Home
How It Works
Charities
Charity Detail
Pricing / Subscription
Draw & Rewards explanation
Authentication

SUBSCRIBER:
Dashboard
Scores
Draws
Winnings
Charity
Subscription
Profile / Settings
Winner Verification

ADMIN:
Overview
Users
Subscriptions
Scores
Draw Management
Draw Simulation
Prize Pools
Charities
Winners
Verification
Payouts
Analytics

Do not expose routes simply because they exist. Navigation should reflect user goals and role.

## 32. NAVIGATION PRINCIPLES
Navigation must answer:
Where am I?
Where can I go?
What matters most?

Use clear hierarchy and active states.

Do not make all destinations visually equal.

Public navigation should emphasize product understanding, charity, rewards, and subscription.
Subscriber navigation should emphasize current participation and action.
Admin navigation should emphasize operational tasks.

## 33. CONTENT HIERARCHY
Content should be structured in layers:
1. Orientation
2. Primary information
3. Decision-supporting information
4. Detail
5. Secondary context

Do not dump all information at once.
Use progressive disclosure when detail is useful but not immediately necessary.

## 34. USER ONBOARDING
Onboarding should teach the product rather than create unnecessary steps.

The user should understand:
- what the platform is
- how subscription works
- how charity selection works
- how scores work
- how draws work

Do not create a long tutorial if the interface itself can teach the workflow.

## 35. FIRST-TIME USER EXPERIENCE
A first-time visitor should be able to understand the product without reading a long manual.

Use concise explanations, visual examples, and progressive disclosure.

The first meaningful action should be obvious.

## 36. CONVERSION FLOW
The subscription journey should feel like a logical continuation of product understanding:
Understand value → Understand mechanics → Understand charity → Understand plan → Subscribe.

Do not push the CTA before trust and clarity are established.

## 37. CTA STRATEGY
Primary CTAs should be specific.
Avoid generic labels like "Submit" when a clearer action exists.

Prefer action language such as:
Choose a plan
Add score
Explore charities
View draw
Upload proof

CTA hierarchy should remain consistent across the system.

## 38. CHARITY DISCOVERY UX
Search and filtering should help users quickly find a relevant cause.

Define useful filter patterns only when supported by actual data.

Do not invent filter categories that the product does not support.

Results should make comparison easy without turning the page into an overwhelming database.

## 39. CHARITY PROFILE UX
The detail page should balance story and operational information.

Suggested hierarchy:
Identity → Mission → Impact → Activity/events → Contribution relationship → Action.

Do not make imagery larger than information requires.

## 40. CONTRIBUTION SELECTION
When selecting charity contribution, the UI should explain:
- chosen charity
- contribution percentage
- resulting contribution amount where supported
- minimum allowed percentage
- ability to increase percentage

Do not rely on color alone to communicate the selected state.

## 41. SCORE HISTORY
Score history should make the rolling-window behavior understandable without overloading the user.

Use hierarchy such as:
Current five scores → recent changes → older context when useful.

Avoid presenting a huge data table when only five active scores matter to the product rule.

## 42. SCORE VALIDATION UX
Validation should be immediate enough to prevent obvious mistakes and calm enough not to interrupt the user.

Errors must explain the problem and recovery path.

The interface must distinguish invalid value, duplicate date, missing date, and unavailable action where applicable.

## 43. DASHBOARD INFORMATION ARCHITECTURE
A subscriber dashboard should begin with an orientation layer:
Subscription state
Current participation status
Next important action

Then show:
Upcoming draw
Score status
Charity impact
Winnings
History/detail

Do not force users to search the page for the next meaningful action.

## 44. DASHBOARD PERSONALIZATION
Personalization should be based on meaningful user state.

Examples:
A new subscriber should see setup guidance.
A user with no score should see score entry.
A winner should see verification status.

Do not add artificial personalization such as random greetings that add no value.

## 45. WINNINGS EXPERIENCE
Winnings should answer:
How much?
From which draw?
What is the current payment state?
What action is required?

Use a clear distinction between:
Potential/announced winnings
Verified winnings
Paid winnings

Do not imply money is paid until the system state confirms it.

## 46. DRAW INFORMATION ARCHITECTURE
Users should be able to distinguish:
Upcoming draw
Published draw
Past draw

For a published draw, show the relevant result and prize information clearly.

Do not bury historical draw information under unrelated dashboard content.

## 47. PRIZE POOL PRESENTATION
The PRD specifies the pool structure:
5-number match = 40%
4-number match = 35%
3-number match = 25%
5-match jackpot can roll over.

Present the allocation transparently.

Avoid visual treatments that imply certainty or payout before the underlying business state is resolved.

## 48. WINNER STATE DESIGN
Winner screens should feel clear, trustworthy, and calm.

Use a state timeline or equivalent visual system to explain progress.

The experience should not create confusion about whether a win is announced, verified, or paid.

## 49. PROOF UPLOAD UX
Proof upload should communicate:
What is required
Allowed file expectations
Upload progress
Submission status
Next step

After successful upload, do not simply close the form. Show the resulting state.

## 50. REJECTION EXPERIENCE
A rejected proof should explain the next action where appropriate.

Avoid vague messages.
Do not expose internal moderation details that are not meant for users.

## 51. ADMIN INFORMATION ARCHITECTURE
Admin pages should follow operational workflows rather than marketing hierarchy.

Recommended mental model:
Monitor → Locate → Inspect → Decide → Execute → Verify.

For example, winner management may follow:
Locate winner → inspect proof → approve/reject → track payout.

## 52. ADMIN OVERVIEW
Admin home should surface operational signals such as:
- users
- subscription state
- prize pool information
- charity contribution totals
- draw state
- winners

Do not turn the overview into a wall of decorative charts.

## 53. SEARCH AND FILTERS
Search and filter systems must reduce work.

Avoid filters that are merely decorative.

Every filter should have an understandable effect on the result set.

Provide clear reset behavior.

## 54. DESTRUCTIVE ACTIONS
Actions such as delete, reject, or payout completion require clear confirmation when the consequence is significant.

The confirmation should state what will change.

Never hide destructive actions behind ambiguous labels.

## 55. AUDIT THINKING
For operational actions, preserve a meaningful record where the architecture supports it.

The UI should make it possible to understand important state transitions.

Never claim an audit feature exists unless it is implemented.

## 56. TRUST THROUGH CONSISTENCY
The same concept must look and behave consistently everywhere.

For example, "Pending" should not look like one state on the dashboard and a completely different state in winner verification unless there is a strong reason.

Consistency creates trust.

## 57. PROGRESSIVE DISCLOSURE
Use progressive disclosure for:
- complex prize rules
- detailed charity information
- verification explanations
- admin details
- historical data

Keep essential information visible.
Hide only supporting detail.

## 58. CONTENT DENSITY
Public pages can use generous whitespace and editorial composition.
Admin pages may require greater density.
Subscriber dashboards should sit between the two.

Density must follow task needs.

## 59. DESIGNED STATES
Every major module should intentionally design:
- first use
- normal use
- empty state
- loading state
- error state
- success state
- permission-restricted state
- unavailable state where relevant

Do not add these states at the end as an afterthought.

## 60. PRODUCT COHERENCE TEST
Move between Home → Subscription → Dashboard → Charity → Draw → Winnings.

The same product language must remain visible.

If each page looks like a different product, the design system is failing.

## 61. EXPERIENCE HANDOFF
Continue with Part 3 for detailed dashboard, scoring, trust, draw, prize, and winner experience direction.
