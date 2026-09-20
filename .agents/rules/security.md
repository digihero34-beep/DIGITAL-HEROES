---
trigger: always_on
---

# Security Rules

Treat every client input as untrusted.

## Authentication

Verify authentication on protected server operations.

## Authorization

Authentication answers:

"Who is this?"

Authorization answers:

"Is this person allowed to perform this action?"

Always perform both where required.

## Admin

Never rely on:

- hidden buttons
- frontend routes
- localStorage
- client state
- URL parameters

for admin authorization.

Admin authorization must be verified server-side.

## Data isolation

A subscriber must never be able to access another subscriber's:

- scores
- profile
- subscription
- winnings
- winner verification
- charity configuration

## Secrets

Never hard-code secrets.

Use environment variables.

Never expose server-only secrets through public environment variables.

## Payments

Verify payment webhooks cryptographically.

Make webhook processing idempotent.

Never trust payment status supplied by the browser.

## Uploads

Validate:

- MIME type
- file extension
- file size
- upload authorization

Never assume uploaded files are safe.

## Database

Use parameterized queries / ORM-safe APIs.

Never construct SQL using raw user input.

## Logging

Never log:

- passwords
- tokens
- API keys
- payment secrets
- sensitive personal data

## Error messages

Do not expose:

- stack traces
- database errors
- internal implementation details
- secrets

to end users.