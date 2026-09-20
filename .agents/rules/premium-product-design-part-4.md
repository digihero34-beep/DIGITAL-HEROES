# DIGITAL HEROES — PREMIUM PRODUCT DESIGN DIRECTIVE
# PART 4 — INTERACTION SYSTEM, COMPONENTS & ADMIN UX

IMPORTANT: Read Parts 1–3 first. Treat Parts 1–7 as one unified directive.

## 96. INTERACTION MODEL
Every meaningful interaction follows:
INTENT → ACTION → FEEDBACK → RESULT.

The user must understand what can be done, whether the action started, what happened, and what comes next.

## 97. PRIMARY INTERACTIONS
Primary interactions include:
- subscribe
- add/edit score
- select charity
- view draw
- upload winner proof
- verify winner
- complete payout workflow
- publish draw

Primary actions must have the strongest visual priority.

## 98. SECONDARY ACTIONS
Secondary actions include:
- edit
- view details
- filter
- search
- manage settings
- explore

They should be visually available without competing with the main task.

## 99. BUTTON SYSTEM
Every button should support appropriate states:
Default
Hover
Focus
Pressed
Loading
Disabled
Success when appropriate

Use semantic variants rather than many boolean flags.

Example:
variant="primary"
size="medium"
state="loading"

## 100. DESTRUCTIVE ACTIONS
Delete, reject, cancel, and other consequential actions require clear confirmation where appropriate.

Confirmation should state what changes.

Do not use ambiguous labels.

## 101. FORM SYSTEM
Forms need:
- clear labels
- predictable layout
- validation
- useful errors
- focus states
- loading feedback
- success feedback
- disabled behavior
- keyboard support

Do not create unnecessary multi-step forms.

## 102. VALIDATION
Validation should prevent errors early without becoming noisy.

Show what is wrong and how to recover.

Never rely solely on browser defaults for important business validation.

## 103. FORM PRESERVATION
When a non-fatal submit fails, preserve user input where safe.

Do not force the user to re-enter everything because one request failed.

## 104. LOADING STATES
Loading should be contextual.

Button operation → button loading.
Page data → page-level loading or skeleton.
Large operation → progress when meaningful.

Do not block the entire screen for a small action.

## 105. EMPTY STATES
An empty state should explain the situation and offer the next useful action.

Examples:
No score → Add score
No selected charity → Explore charities
No winnings → Explain where results appear
No admin results → Adjust filters

## 106. ERROR STATES
Errors should communicate:
What happened
What the user can do
Whether the state was changed

Avoid generic technical messages.

## 107. SUCCESS STATES
Feedback should be proportional.

Small update → subtle confirmation.
Major workflow → clear confirmation and next step.

Do not create celebratory animation for routine actions.

## 108. TOASTS
Use toasts for short-lived confirmation or non-blocking status.

Do not put critical information only in a toast that disappears.

Important workflow results need persistent UI state.

## 109. MODALS
Use modals for focused decisions, confirmation, or contained tasks.

Do not use modals for every interaction.

Avoid nested modals.

## 110. DRAWERS
Drawers can support detail inspection without losing context.

Useful for:
- admin record details
- mobile navigation
- contextual information

Ensure keyboard and focus behavior is correct.

## 111. TABS
Use tabs only when sections are genuinely parallel.

Do not hide unrelated tasks behind tabs.

Active state must be obvious.

## 112. STATUS SYSTEM
Create reusable status components.

Each status should contain:
- semantic text
- consistent visual treatment
- accessible meaning

Color can reinforce but cannot be the only signal.

## 113. FILE UPLOAD
Winner proof upload should communicate:
requirements → selected file → upload progress → completed upload → submitted state.

Validate file expectations before submission where practical.

Never imply that a file was submitted when only selected locally.

## 114. COMPONENT SYSTEM
Create reusable primitives when they produce consistency.

Suggested primitives:
Button
Input
Select
DateInput
Card
Stat
Badge
Status
Table
Modal
Drawer
Tabs
Toast
Tooltip
Timeline
Stepper
FileUpload
EmptyState
ErrorState
LoadingState
ConfirmDialog
Chart

Do not abstract every HTML fragment.

## 115. COMPONENT RESPONSIBILITY
Each component should have one clear responsibility.

Avoid components that combine fetching, business logic, validation, layout, and unrelated presentation when separation would improve maintainability.

Business-critical rules should remain testable outside visual components.

## 116. COMPONENT STATES
Reusable components should have a consistent state model.

For example, forms may need:
Idle
Focused
Invalid
Submitting
Success
Failure
Disabled

## 117. DESIGN TOKENS
Centralize shared values for:
- colors
- spacing
- typography
- border radius
- shadows
- motion
- breakpoints
- layering

Do not distribute arbitrary visual constants across files.

## 118. ADMIN INFORMATION DENSITY
Admin UX should prioritize:
- speed
- scanning
- search
- filters
- sorting
- status visibility
- safe actions

Do not make admin pages visually sparse when operational density is necessary.

## 119. ADMIN OVERVIEW
The admin dashboard should help a reviewer understand system state quickly.

Potential information:
Users
Subscriptions
Prize pool
Charity contributions
Draw status
Winners

Only show metrics that the backend actually supports.

## 120. ADMIN TABLES
Operational tables may need:
- search
- filter
- sorting
- pagination
- row actions
- status
- detail view
- empty state
- loading state
- error state

Do not force every column into the mobile viewport.

## 121. ADMIN DRAW FLOW
Separate:
Configure → Simulate → Review → Publish.

The design must discourage accidental publication.

## 122. ADMIN CHARITY MANAGEMENT
Charity management should support the actual PRD requirements without inventing unsupported editorial workflows.

Use clear create/edit/delete patterns and media/content management only where the implementation exists.

## 123. ADMIN WINNER FLOW
A winner management screen should make it easy to:
Find winner → inspect submission → approve/reject → track payout.

Avoid decorative complexity.

## 124. ADMIN SAFETY
High-impact actions require clear state and confirmation.

Do not provide a destructive primary action simply because it is technically available.

## 125. CONFIRMATION DESIGN
Confirmation dialogs should explain:
Action
Consequence
Available alternatives when relevant

The primary action should match the consequence.

## 126. INTERACTION CONSISTENCY
If a pattern is used in one module, reuse it when the same problem appears elsewhere.

The product should feel like one system.

## 127. MOBILE COMPONENT BEHAVIOR
Components need intentional mobile behavior.

Tables may become cards or detail views.
Navigation may become a drawer.
Secondary actions may collapse.

Do not simply shrink desktop components.

## 128. ACCESSIBLE COMPONENTS
Reusable components must support:
- keyboard use
- focus visibility
- semantic labels
- screen-reader meaning
- sufficient contrast

## 129. COMPONENT REVIEW
Before creating a new component ask:
Does a suitable primitive already exist?
Can an existing component be extended safely?
Does the new abstraction improve consistency?

Avoid component duplication.

## 130. DESIGN SYSTEM HEALTH
As the UI grows, periodically inspect for:
- duplicate buttons
- duplicate cards
- inconsistent status colors
- random spacing
- inconsistent radius
- inconsistent typography

Refactor the system instead of allowing drift.

## 131. NEXT LAYER
Continue with Part 5 for motion, responsive design, accessibility, and performance.
