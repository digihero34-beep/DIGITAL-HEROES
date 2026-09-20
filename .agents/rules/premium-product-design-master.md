---
trigger: always_on
---

# DIGITAL HEROES — UNIFIED PREMIUM PRODUCT DESIGN MASTER RULE

## PURPOSE

This is the master entry point for the Digital Heroes Premium Product
Design System.

The following seven files together form ONE unified design directive:

@premium-product-design-part-1.md
@premium-product-design-part-2.md
@premium-product-design-part-3.md
@premium-product-design-part-4.md
@premium-product-design-part-5.md
@premium-product-design-part-6.md
@premium-product-design-part-7.md

Read all seven parts together.

Never interpret an individual part as an independent design system.

Do not restart the design direction when moving from one part to another.

Do not contradict decisions established in previous parts.

---

# SOURCE OF TRUTH

The Digital Heroes PRD remains the primary source of truth for:

- Product requirements
- Business rules
- User roles
- Subscription behavior
- Score rules
- Draw rules
- Prize-pool rules
- Charity rules
- Winner verification
- User dashboard requirements
- Admin dashboard requirements

The seven premium design files define HOW those requirements should be
experienced visually and interactively.

If a design instruction conflicts with an explicit PRD requirement:

FOLLOW THE PRD.

Do not silently change product behavior.

If the PRD is ambiguous:

1. Identify the ambiguity.
2. Explain the possible interpretations.
3. Record the selected assumption.
4. Ensure the UI reflects the selected assumption clearly.

Never invent hidden business rules.

---

# COMPLETE DESIGN PHILOSOPHY

Digital Heroes must NOT feel like:

- Generic SaaS
- Generic fintech
- Generic AI startup
- Casino software
- Gaming UI
- Crypto interface
- Traditional golf website
- AI-generated template

The experience must communicate:

- Purpose
- Participation
- Charity impact
- Reward
- Trust
- Transparency
- Modern technology
- Product maturity
- Emotional engagement

The interface must feel:

- intentional
- premium
- distinctive
- modern
- human
- trustworthy
- polished
- coherent
- production-ready

---

# PRODUCT-FIRST DESIGN

Never design screens independently from the product.

Understand the complete relationship:

PURPOSE
→ PARTICIPATION
→ PERFORMANCE
→ CONTRIBUTION
→ DRAW
→ REWARD
→ VERIFICATION
→ IMPACT

The product should feel like one connected platform.

Every major visual or interaction decision must have a product reason.

Ask:

Why does this exist?

What user problem does it solve?

What user action does it support?

What product concept does it communicate?

What happens before this?

What happens after this?

---

# NO GENERIC TEMPLATE

Never blindly use:

- Generic hero sections
- Generic feature-card grids
- Generic pricing sections
- Generic dashboards
- Generic metric cards
- Generic glassmorphism
- Random gradients
- Random 3D decoration
- Decorative blobs
- Repetitive rounded cards

Do not optimize for "looks modern".

Optimize for product-specific clarity.

If a section feels like it could belong to any SaaS company:

REDESIGN IT.

---

# VISUAL LANGUAGE

Maintain one consistent system across the entire product.

Use the design language established by Parts 1–7 for:

- Typography
- Color
- Spacing
- Grid
- Surfaces
- Components
- Imagery
- Iconography
- Motion
- Status
- Data visualization

Do not invent a new visual language for each page.

---

# UX HIERARCHY

Every screen must clearly communicate:

1. What is happening?
2. What matters?
3. What can the user do?
4. What happens next?

Use:

- typography
- whitespace
- contrast
- position
- grouping
- motion

to create hierarchy.

Do not give every element equal visual importance.

---

# CHARITY

Charity is a core part of the experience.

Do not treat charity as a secondary footer section.

Make charity meaningful through:

- storytelling
- authentic imagery
- contribution information
- impact metrics
- discovery
- charity profiles
- contextual contribution information

Do not fabricate charity facts.

Use data provided by the system.

---

# SUBSCRIPTION

Subscription UX must communicate:

- Available plans
- Price
- Monthly/yearly distinction
- Renewal
- Cancellation
- Charity contribution
- Participation relationship

Do not hide important commercial information.

Do not use dark patterns.

---

# SCORE EXPERIENCE

Score entry must be simple and understandable.

The UI must support the PRD score rules.

The user should clearly understand:

- Date
- Score
- Validation
- Current five-score set
- Update
- Replacement behavior where applicable

Never hide business logic behind unexplained UI behavior.

---

# DRAW EXPERIENCE

The draw must feel:

- transparent
- fair
- technically sophisticated
- controlled
- exciting
- trustworthy

Do NOT make it look like gambling or casino software.

Separate clearly:

Simulation
vs
Published Result

Animation must never determine business logic.

---

# PRIZE EXPERIENCE

Prize information must be understandable.

Users should be able to understand:

- Prize pool
- Match tier
- Relevant reward
- Rollover concept
- Winner state
- Payment status

Do not obscure important financial information.

---

# WINNER VERIFICATION

Represent the process clearly.

Possible states include:

Winner identified
→ Proof required
→ Submitted
→ Under review
→ Approved / Rejected
→ Payment pending
→ Paid

Every state must explain:

- Current state
- What happened
- Required action
- Next step

---

# USER DASHBOARD

Do not build a dashboard simply from cards.

Prioritize:

1. Current status
2. Important action
3. Upcoming activity
4. Progress
5. Charity impact
6. Rewards
7. History

Use meaningful hierarchy.

---

# ADMIN EXPERIENCE

Admin UI must prioritize:

- operational clarity
- search
- filtering
- sorting
- status
- safe actions
- confirmation
- data density
- audit visibility

Do not prioritize decoration over operational usefulness.

---

# INTERACTION

Important interactions follow:

INTENT
→ ACTION
→ FEEDBACK
→ RESULT

Every important action should communicate its state.

Support where appropriate:

- Default
- Hover
- Focus
- Press
- Loading
- Disabled
- Success
- Error

---

# MOTION

Motion must communicate:

- change
- direction
- state
- feedback
- hierarchy

Do not animate simply to impress.

Do not block navigation.

Respect reduced-motion preferences.

---

# RESPONSIVE DESIGN

Design intentionally for:

- Mobile
- Tablet
- Desktop

Do not simply stack the desktop interface.

Review:

- navigation
- typography
- spacing
- forms
- tables
- charts
- cards
- actions
- modals
- drawers

---

# ACCESSIBILITY

Accessibility is part of product quality.

Maintain:

- semantic structure
- keyboard navigation
- visible focus
- meaningful labels
- readable contrast
- logical headings
- accessible errors
- reduced-motion support

Never rely only on color.

---

# PERFORMANCE

Do not sacrifice performance for visual effects.

Avoid unnecessary:

- JavaScript
- client rendering
- network requests
- animation libraries
- oversized images
- dependencies

Use appropriate optimization strategies.

---

# COMPONENT SYSTEM

Prefer reusable, consistent components.

Examples:

Button
Input
Select
DateInput
Modal
Drawer
Tabs
Badge
Status
Card
Stat
Table
Chart
Toast
Stepper
Timeline
EmptyState
ErrorState
LoadingState
ConfirmDialog
FileUpload

Do not create abstractions without meaningful reuse.

---

# STATES

Important UI must support appropriate:

- Loading
- Empty
- Error
- Success
- Disabled
- Processing
- Pending
- Approved
- Rejected
- Paid
- Cancelled
- Published
- Draft

Do not leave users uncertain about system state.

---

# DESIGN REVIEW

Never assume generated UI is correct.

Inspect the rendered interface.

Review:

- visual hierarchy
- alignment
- spacing
- typography
- consistency
- responsive behavior
- interaction feedback
- accessibility
- performance
- product clarity

Fix issues rather than merely describing them.

---

# ANTI-TEMPLATE TEST

After implementation ask:

Could this have been generated from:

"Create a modern SaaS website"?

If YES:

Refine it.

Remove generic patterns and strengthen product-specific design.

---

# RECRUITER TEST

Imagine a hiring manager opens the project.

Within approximately one minute, can they understand:

- What Digital Heroes is
- Why it matters
- How users participate
- How charity is involved
- How rewards work
- How trust is established

Can they see:

- product thinking
- UX maturity
- design-system thinking
- engineering awareness
- attention to detail

If not:

Improve the product.

---

# SENIORITY PRINCIPLE

Do not imitate seniority through unnecessary complexity.

Demonstrate maturity through:

- restraint
- hierarchy
- clarity
- consistency
- accessibility
- responsive thinking
- business understanding
- edge-state thinking
- product reasoning

Good judgment is more important than visual complexity.

---

# IMPLEMENTATION PROCESS

Before a major UI implementation:

1. Read the relevant PRD requirement.
2. Read the relevant premium design sections.
3. Understand the existing architecture.
4. Define UX objective.
5. Define information hierarchy.
6. Define states.
7. Implement.
8. Render.
9. Inspect.
10. Refine.
11. Verify responsive behavior.
12. Verify accessibility.
13. Run relevant tests.

Never build an entire product blindly in one pass.

---

# COMPLETION STANDARD

A screen is NOT complete merely because:

- It compiles.
- It renders.
- It looks attractive.

A screen is complete when:

- PRD requirement is satisfied.
- UX objective is clear.
- Visual hierarchy is strong.
- States are handled.
- Responsive behavior works.
- Accessibility is considered.
- Interactions are consistent.
- Design system is respected.
- Product identity is visible.
- No generic template pattern dominates.
- Rendered output has been inspected.

---

# FINAL PRINCIPLE

Do not ask:

"How can we make this website look impressive?"

Ask:

"How can we create the most coherent, trustworthy, emotionally engaging,
usable, distinctive, accessible, performant, and product-specific Digital
Heroes experience possible?"

The final experience must feel:

DESIGNED
not generated

PRODUCT-LED
not template-led

PURPOSEFUL
not decorative

PREMIUM
not excessive

MEMORABLE
not confusing