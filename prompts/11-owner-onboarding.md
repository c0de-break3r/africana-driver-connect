Read AGENTS.md fully — Onboarding & Role Routing Rules are critical.

Build the complete vehicle owner onboarding flow.

## Current State

`useOnboardingAnswersStore` captures `vehicleCount` and `ownerPainPoint` from `foundational-questions.tsx`. No owner-specific onboarding screens exist. After role selection, owners route to `(onboarding)/trial` (placeholder).

## Tasks

1. **Create owner onboarding screens** under `(onboarding)/owner/`:
   - `company.tsx` — company/fleet name (optional)
   - `vehicles.tsx` — number of vehicles and types (use `data/vehicleTypes.ts`)
   - `requirements.tsx` — what the owner looks for in drivers (experience, license class, location)
   - `verification.tsx` — business registration documents upload (defer to "complete later")
   - `summary.tsx` — review all answers, edit any field, confirm
2. **Create `convex/owners.ts` functions** (extend existing):
   - `createProfile` — save owner onboarding data
   - `updateRequirements` — save driver requirements
3. **Create `src/hooks/useOwnerOnboarding.ts`** — orchestrates step flow, writes to Convex
4. **Create `src/store/useOwnerOnboardingStore.ts`** — step state (currentStep, form fields)
5. **Create owner step shell** — similar to `DriverStepShell` but for owner flow (reuse `ScreenContainer`, `ProgressBar`, `PageDots`)
6. **Update routing** — after owner onboarding, route to `(owner)` dashboard
7. **Update `lib/routing.ts`** — owner role routes to `(owner)` instead of `trial`

## Design

- Use design tokens from `global.css` (peach background, navy text, orange accents)
- Match `DriverStepShell` visual quality — progress bar, step counter, back button
- Use Ionicons for vehicle type icons
- Premium, polished feel — this is a business user paying for drivers

## Rules

- Follow existing onboarding patterns (ScreenContainer + step progression)
- Defer heavy verification to "complete later"
- Run `bun run typecheck` and `bun run lint` — fix all errors
