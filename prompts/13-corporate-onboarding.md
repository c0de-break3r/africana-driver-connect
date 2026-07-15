Read AGENTS.md fully — Onboarding & Role Routing Rules are critical.

Build the complete corporate client onboarding flow.

## Current State

`useOnboardingAnswersStore` captures `orgSize` and `corporateChallenge` from `foundational-questions.tsx`. No corporate-specific onboarding screens exist. After role selection, corporate routes to `(onboarding)/trial` (placeholder).

## Tasks

1. **Create corporate onboarding screens** under `(onboarding)/corporate/`:
   - `organization.tsx` — company name, industry, size (employees)
   - `fleet-needs.tsx` — what they need: drivers, vehicles, both? How many? Duration (short/long-term)?
   - `requirements.tsx` — compliance needs, insurance requirements, background check preferences
   - `contact.tsx` — primary contact person, phone, billing email
   - `summary.tsx` — review all answers, confirm
2. **Create `convex/corporate.ts`** — new Convex module:
   - `createProfile({ companyName, industry, orgSize, fleetNeeds, complianceReqs, contactName, contactPhone, billingEmail })` — creates corporate profile
   - `getByUserId(userId)` — returns corporate profile
3. **Create `src/hooks/useCorporateOnboarding.ts`** — orchestrates flow
4. **Create `src/store/useCorporateOnboardingStore.ts`** — step state
5. **Create corporate step shell** — reuse shared components
6. **Update routing** — after corporate onboarding, route to `(corporate)` dashboard
7. **Update `lib/routing.ts`** — corporate role routes to `(corporate)` instead of `trial`

## Design

- Corporate users expect a professional, streamlined experience
- Use clean forms with clear labels
- Multi-select for fleet needs (driver types, vehicle types)
- Show progress through the flow

## Rules

- Corporate onboarding is more data-heavy — use smart defaults and "skip for now" options
- Compliance and insurance fields are important but can be completed later
- Run `bun run typecheck` and `bun run lint` — fix all errors
