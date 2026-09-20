# DIGITAL HEROES — PREMIUM PRODUCT DESIGN DIRECTIVE
# PART 5 — MOTION, RESPONSIVE DESIGN, ACCESSIBILITY & PERFORMANCE

IMPORTANT: Read Parts 1–4 first. Treat Parts 1–7 as one directive.

## 132. MOTION PHILOSOPHY
Motion exists to communicate change, hierarchy, feedback, orientation, or system state.

Do not animate simply because animation looks impressive.

## 133. MOTION QUESTIONS
Every meaningful animation should help answer at least one:
- Where did this come from?
- Where did this go?
- What changed?
- What should I notice?
- What is processing?
- What succeeded?

If it answers none, remove it.

## 134. MOTION LEVELS
Define a coherent hierarchy:
Fast = direct interaction feedback
Medium = component/page transition
Slow = emphasis or storytelling

Do not randomly choose durations per component.

## 135. BUTTON MOTION
Button interaction should acknowledge:
Hover → Press → Loading → Result.

Keep motion subtle and fast.

Avoid large scale jumps that feel unstable.

## 136. PAGE TRANSITIONS
Page transitions should be quick and orientation-preserving.

Do not delay navigation for cinematic effect.

The user should remain in control.

## 137. SCROLL MOTION
Use scroll-based motion to reveal relationships or create storytelling rhythm.

Avoid:
- scroll hijacking
- constant parallax
- excessive zoom
- delayed readability
- motion behind critical controls

## 138. DRAW MOTION
The draw is an appropriate place for stronger motion than routine UI, but the motion must remain trustworthy.

Use controlled reveal, focus changes, number sequencing, and result emphasis.

Never use casino-like flashing or misleading suspense.

## 139. SCORE MOTION
When a new score changes the active five, a subtle transition may show the list update.

The final state must remain obvious without animation.

## 140. SUCCESS MOTION
Major product events may use restrained celebration.

Routine operations should use lightweight confirmation.

Do not make every click feel like an achievement ceremony.

## 141. REDUCED MOTION
Respect reduced-motion preferences.

When reduced motion is enabled:
- preserve state changes
- preserve hierarchy
- preserve feedback
- remove unnecessary movement

No essential product meaning should depend on animation.

## 142. RESPONSIVE STRATEGY
Design intentionally for:
- mobile
- tablet
- desktop

Do not define desktop first and rely on automatic stacking.

For each page determine:
- navigation
- type scale
- spacing
- layout
- component priority
- data density
- action order

## 143. MOBILE PRIORITY
On mobile, preserve the primary user goal first.

For subscribers, likely priority is:
Dashboard → scores → draw → charity → winnings.

For admin, priority follows operational workflow.

Do not expose every desktop action at equal prominence.

## 144. MOBILE NAVIGATION
Use a navigation pattern based on actual task frequency.

Do not add bottom navigation merely because it is fashionable.

Make active state and location obvious.

## 145. MOBILE FORMS
Forms should avoid unnecessary horizontal layout.

Use readable inputs, clear labels, appropriate keyboards, and visible submit feedback.

## 146. RESPONSIVE TABLES
Do not squeeze large tables into unreadable mobile layouts.

Use:
- priority columns
- expandable details
- drawers
- cards
- controlled horizontal scroll only when genuinely required

## 147. RESPONSIVE CHARTS
Charts must remain readable on small screens.

Prefer simplified labels and touch-friendly interactions over preserving desktop density.

If a chart cannot remain useful on mobile, provide a meaningful alternative view.

## 148. TYPOGRAPHY RESPONSIVENESS
Type scale should adapt with the viewport.

Avoid oversized hero text causing clipping or awkward wrapping on mobile.

Maintain hierarchy without sacrificing readability.

## 149. TOUCH EXPERIENCE
Important controls need comfortable touch targets.

Avoid tightly packed actions.

Consider thumb reach, keyboard behavior, sticky actions, and mobile scrolling.

## 150. ACCESSIBILITY FOUNDATION
Use:
- semantic HTML
- logical heading hierarchy
- labels associated with controls
- visible focus
- keyboard navigation
- accessible status meaning
- useful error text
- sufficient contrast

## 151. COLOR ACCESSIBILITY
Do not rely on color alone to communicate:
- success
- error
- pending
- selection
- winning

Use text, icons, shape, or other redundant signals.

## 152. KEYBOARD ACCESSIBILITY
All interactive controls should be reachable and understandable using the keyboard.

Focus should not disappear.

Dialog and drawer focus should be managed correctly.

## 153. SCREEN READER SUPPORT
Important visual information must have semantic equivalents.

Charts should expose meaningful summary information where appropriate.

Icon-only controls require accessible labels.

## 154. PERFORMANCE PRINCIPLE
Premium UX must still feel fast.

Avoid unnecessary:
- client rendering
- JavaScript
- dependencies
- network calls
- large images
- animation libraries
- polling

## 155. IMAGE PERFORMANCE
Use appropriately sized images and modern optimization strategies supported by the chosen stack.

Do not ship giant original images when a smaller derivative will do.

## 156. MOTION PERFORMANCE
Avoid heavy continuous animations.

Do not animate large numbers of DOM nodes without a clear reason.

Prioritize responsive interaction over visual spectacle.

## 157. DATA LOADING
Choose loading UI based on operation type.

Avoid blocking the whole page when only one module is loading.

Use meaningful skeletons only where they improve perceived structure.

## 158. ERROR PERFORMANCE
Network failures should not freeze the entire experience.

Provide local recovery where possible.

## 159. RESPONSIVE QUALITY REVIEW
Inspect at realistic mobile, tablet, and desktop widths.

Check:
- type wrapping
- navigation
- spacing
- cards
- forms
- charts
- tables
- modals
- drawers
- sticky actions

## 160. ACCESSIBILITY QUALITY REVIEW
Test keyboard navigation, visible focus, semantic structure, contrast, reduced motion, form errors, and interactive labels.

Do not assume a visually clean UI is accessible.

## 161. PERFORMANCE QUALITY REVIEW
Inspect bundle behavior, image weight, unnecessary network requests, long tasks, and interaction delay where tooling allows.

Do not make unsupported performance claims.

## 162. MOTION QUALITY REVIEW
Remove animation that:
- delays reading
- causes distraction
- repeats without purpose
- hides data
- reduces performance

## 163. RESPONSIVE PRODUCT THINKING
A mobile version is not a smaller desktop.

It is the same product reorganized around mobile priorities.

## 164. ACCESSIBLE PRODUCT THINKING
Accessibility is not a final checklist.

It must influence component choice, interaction design, state communication, and content hierarchy from the beginning.

## 165. PERFORMANCE PRODUCT THINKING
Do not make users pay with slow load times for decorative visual complexity.

## 166. NEXT LAYER
Continue with Part 6 for design tokens, data visualization, visual QA, originality review, and engineering-aware design validation.
