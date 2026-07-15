Read AGENTS.md fully — Onboarding & Role Routing Rules are critical.

Refine the existing driver onboarding flow to sync data with Convex and polish the UX.

## Current State

10-step driver onboarding exists under `(onboarding)/driver/`: experience → employment → goals → license → license-verify → vehicle → job-type → location → otp. All screens use `DriverStepShell` and write to `useDriverOnboardingStore` (Zustand). No Convex integration.

## Tasks

1. **Create `data/driverCategories.ts`** — hardcoded typed reference data:
   - Job types: chauffeur, truck, bus, school, ride-hailing, corporate, delivery, heavy equipment
   - Vehicle types: sedan, SUV, truck, bus, motorcycle, van, minibus, trailer
   - License classes: B, C, D, E with descriptions
2. **Create `data/vehicleTypes.ts`** — vehicle type options with icons and descriptions
3. **Create `src/hooks/useDriverOnboarding.ts`** — orchestrates step progression, validates each step, writes to Convex via mutations, reads from Convex on resume
4. **Sync onboarding data to Convex** — on each step completion, call `drivers.createProfile` or `drivers.updateProfile` mutation to persist data
5. **Update `license.tsx`** — use reference data from `data/` instead of hardcoded arrays
6. **Update `vehicle.tsx`** — use `data/vehicleTypes.ts` for the multi-select grid
7. **Update `job-type.tsx`** — use `data/driverCategories.ts` for job type options
8. **Add "Complete later" option** — defer license upload and vehicle documents to post-onboarding (AGENTS.md: "Do not block account creation on document upload")
9. **Update `otp.tsx`** — on Clerk account creation, also create Convex user and driver profile
10. **Consolidate overlapping stores** — `yearsExperience` and `employmentStatus` exist in both `useDriverOnboardingStore` and `useOnboardingAnswersStore`. Merge into one source of truth.

## Rules

- Match existing UI pixel-perfectly — no visual changes
- Use `DriverStepShell` for all step screens
- Use Ionicons (not emojis) for all icons
- Run `bun run typecheck` and `bun run lint` — fix all errors
