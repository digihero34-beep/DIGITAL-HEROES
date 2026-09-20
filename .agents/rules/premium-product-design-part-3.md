# DIGITAL HEROES — PREMIUM PRODUCT DESIGN DIRECTIVE
# PART 3 — SCORE, DASHBOARD, DRAW, PRIZE & WINNER EXPERIENCE

IMPORTANT: Read Parts 1–2 first. Treat Parts 1–7 as one continuous instruction. Never contradict the PRD.

## 62. SCORE ENTRY EXPERIENCE
The score workflow must feel lighter than a generic data-entry form.

Primary flow:
Select date → Enter Stableford score → Validate → Save → Confirm → Update current five.

Support clear edit/delete affordances.

The interface must communicate that one score per date is allowed and that the active set is limited to the latest five scores.

## 63. SCORE INPUT DESIGN
Score input should make the valid range clear: 1–45.

Avoid confusing controls that make entering a simple score feel difficult.

Use clear focus and error states.

Do not accept invalid values visually and then fail later.

## 64. ROLLING FIVE EXPERIENCE
The five-score set is a product rule and should be visible.

When a sixth score is added, communicate that the oldest active score is replaced according to the PRD rule.

Example concept:
NEW 42
Current set → 42, 39, 38, 34, 31
Oldest removed → previous 5th value.

Do not rely on animation alone; the final state must be explicit.

## 65. SCORE EDITING
Editing a score should make it obvious what date/value is being changed.

After save, show the resulting five-score state.

Do not silently reorder without understandable feedback.

## 66. SCORE DELETE
Deletion should be safe and predictable.

If the product permits delete, confirm the consequence where appropriate and immediately reflect the new state.

## 67. SCORE EMPTY STATE
For a new user, explain why entering scores matters and provide a clear next action.

Do not show a large empty table with no context.

## 68. SUBSCRIBER DASHBOARD HERO
The top of the dashboard should answer:
"What is my status right now?"

Potential top-level information:
Subscription status
Upcoming draw
Current score set
Charity selection
Winnings state

Prioritize actual user relevance over generic dashboard decoration.

## 69. DASHBOARD PRIMARY ACTION
The dashboard should surface the next meaningful action.

Examples:
No score → Add score
No charity → Select charity
Winner proof needed → Upload proof
Upcoming draw → View draw

Do not always show the same CTA regardless of state.

## 70. DASHBOARD STATISTICS
Use statistics only when they help decision making.

Useful candidates:
Current five-score summary
Upcoming draw timing
Charity contribution
Winnings
Participation history

Avoid vanity metrics.

## 71. DASHBOARD CHARTS
A chart is justified only when it answers a question.

Possible questions:
How has my score changed?
How much have I contributed?
What is my winnings history?

Every chart needs meaningful empty, loading, and responsive states.

## 72. DRAW EXPERIENCE
The draw is one of the most distinctive product moments.

Create a journey that is:
Transparent
Controlled
Exciting
Trustworthy

The draw should feel like a product ritual, not a slot machine.

## 73. DRAW STATES
Represent:
Upcoming
Configured
Simulated
Published
Completed

Do not blur simulation and published result.

## 74. DRAW SIMULATION UX
Admin simulation should provide:
- selected draw configuration
- simulated result
- winner matching preview
- prize pool calculation preview
- clear indication that this is not published

Publishing must be a deliberate separate action.

## 75. DRAW REVEAL
If animated reveal is used, animation is presentation only.

The authoritative result comes from the system.

The user must be able to read the final numbers clearly without replaying an animation.

## 76. MATCH VISUALIZATION
Show how selected numbers relate to the user's numbers or winning criteria where applicable.

Use visual emphasis carefully.

Do not create misleading visual effects that imply a win when the business state says otherwise.

## 77. PRIZE POOL EXPERIENCE
The PRD defines:
5-number match = 40%
4-number match = 35%
3-number match = 25%
5-match jackpot rollover if unclaimed.

Present these rules in a transparent way.

For multiple winners, explain that the relevant tier is split equally.

## 78. PRIZE TRANSPARENCY
A user should be able to understand:
How the pool is formed
Which tier exists
What percentage belongs to the tier
Whether rollover applies
How multiple winners affect the split

Do not hide the rules behind unnecessary interactions.

## 79. WINNER EXPERIENCE
When a win is identified, the interface should clearly distinguish:
Result announced
Winner eligible
Proof required
Under review
Verified
Payment pending
Paid

Do not combine these into one vague "Winner" badge.

## 80. WINNER VERIFICATION TIMELINE
A visual timeline or clear status progression should communicate ownership and next step.

Each state should answer:
What happened?
What is needed?
Who acts next?
What happens after that?

## 81. PROOF UPLOAD
Proof upload should be calm and explicit.

Provide:
- requirement explanation
- upload affordance
- progress
- submission confirmation
- review status

Never let the user wonder whether the file was received.

## 82. PAYMENT STATE
The UI must distinguish pending and paid states exactly as the system knows them.

Never represent a payment as complete because the frontend assumed success.

## 83. CHARITY ON DASHBOARD
Charity should have meaningful dashboard presence without overwhelming other user needs.

Useful contexts:
Selected charity
Contribution percentage
Personal contribution
Platform impact

Do not repeat the same number without context.

## 84. IMPACT PRESENTATION
Possible hierarchy:
Your contribution
→ Your selected charity
→ Broader platform impact

Do not imply a user's personal contribution equals total platform impact.

## 85. TRUST MOMENTS
Important trust moments include:
Subscription confirmation
Contribution confirmation
Draw publication
Winner identification
Proof submission
Verification decision
Payment state

Each should provide clear feedback.

## 86. ERROR RECOVERY
When a score cannot save, a charity selection fails, or a proof upload fails, the user should know what to do next.

Do not remove form state unnecessarily.

## 87. DATA DENSITY
Subscriber pages should be informative but not administrative.

Admin pages can be denser because the user is doing operational work.

Public pages should generally have more narrative whitespace.

## 88. STATUS LANGUAGE
Create a consistent status vocabulary.

Examples:
Active
Inactive
Upcoming
Processing
Pending
Approved
Rejected
Paid
Published
Draft

Use the same term for the same concept everywhere.

## 89. DASHBOARD RESPONSIVENESS
Do not simply stack desktop cards on mobile.

Reorder content according to mobile priorities.

The primary action should remain discoverable.

## 90. DRAW RESPONSIVENESS
A number-reveal experience that works on desktop may become confusing on mobile.

Use simplified motion, strong spacing, and readable results.

## 91. ADMIN DRAW MANAGEMENT
Admin draw management should separate:
Configuration
Simulation
Review
Publication

A single uncontrolled "Run Draw" button is not acceptable for a high-trust workflow.

## 92. ADMIN WINNER MANAGEMENT
Winner tools should support:
Locate → Inspect → Decide → Record → Track payout.

Information must be dense enough for operations but still scannable.

## 93. PRODUCT FEEL
The user should feel:
"This system knows what state I am in."

Every meaningful action should update the interface in a visible, logical way.

## 94. FINAL SCORE/DRAW REVIEW
Before completion test scenarios:
- no scores
- one score
- five scores
- sixth score
- duplicate date
- invalid score
- upcoming draw
- simulated draw
- published draw
- no winner
- multiple winners
- winner with pending proof
- verified winner
- paid winner

## 95. NEXT LAYER
Continue with Part 4 for interaction patterns, component behavior, forms, states, and admin UX.
