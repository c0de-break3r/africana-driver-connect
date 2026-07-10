Read AGENTS.md fully and strictly follow it before starting.

Build (onboarding)/client-setup.tsx:

Step 1: Location (capture via device location permission, fallback to manual entry)
Step 2: Preferred payment method (Mobile Money, Card, Cash — placeholder selection only, no real payment integration yet)
Step 3: Primary use case — occasion type: Wedding, Airport, Event, Daily Commute, Other
(This field matters — it differentiates Client from generic ride-hailing per AGENTS.md. Store it clearly as `preferredOccasionType`.)

Store in store/useClientProfileStore.ts.

Route directly to (client)/dashboard — no verification gate for Clients.
