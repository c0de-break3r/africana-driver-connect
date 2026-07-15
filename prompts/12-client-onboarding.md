Read AGENTS.md fully — "For the Client role, capture occasion type as part of onboarding/booking context."

Build the complete client onboarding flow.

## Current State

`useOnboardingAnswersStore` captures `preferredOccasionType` and `bookingFrequency` from `foundational-questions.tsx`. No client-specific onboarding screens exist. After role selection, clients route to `(onboarding)/trial` (placeholder).

## Tasks

1. **Create `data/occasionTypes.ts`** — hardcoded typed reference data:
   - Wedding, corporate event, airport transfer, daily commute, birthday/party, funeral, date night, road trip, school run, medical appointment
   - Each with: name, description, icon (Ionicons name), typical duration, price range indicator
2. **Create client onboarding screens** under `(onboarding)/client/`:
   - `occasions.tsx` — select occasion types (multi-select grid with icons and descriptions)
   - `preferences.tsx` — preferred vehicle type, budget range, frequency (occasional/regular)
   - `location.tsx` — primary area/city for bookings
   - `summary.tsx` — review all answers, confirm
3. **Create `convex/clients.ts`** — new Convex module:
   - `createProfile({ occasionTypes, vehiclePreference, budgetMin, budgetMax, frequency, location })` — creates client profile
   - `getByUserId(userId)` — returns client profile
4. **Create `src/hooks/useClientOnboarding.ts`** — orchestrates flow
5. **Create `src/store/useClientOnboardingStore.ts`** — step state
6. **Create client step shell** — reuse `ScreenContainer` and shared components
7. **Update routing** — after client onboarding, route to `(client)` dashboard
8. **Update `lib/routing.ts`** — client role routes to `(client)` instead of `trial`

## Design

- Match existing onboarding visual quality
- Occasion type cards should be visually rich — icon + title + description
- Use the peach/navy/orange color palette
- Budget range slider with currency display

## Rules

- Occasion type is the core differentiator — make it prominent and easy to select
- Defer payment setup to dashboard (not during onboarding)
- Run `bun run typecheck` and `bun run lint` — fix all errors
