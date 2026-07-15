Read AGENTS.md fully.

Set up testing infrastructure and write tests for critical features.

## Tasks

1. **Install testing dependencies**:
   - `@testing-library/react-native` — component testing
   - `@testing-library/jest-native` — custom matchers
   - `jest` — test runner
   - `jest-expo` — Expo preset
2. **Configure Jest** — add `jest.config.js` with Expo preset, NativeWind transform, Convex mocks
3. **Write unit tests for Convex functions** (test business logic without UI):
   - `convex/users.test.ts` — createOrUpdateFromClerk, updateRole, duplicate Clerk ID handling
   - `convex/drivers.test.ts` — createProfile, updateVerificationStatus
   - `convex/jobs.test.ts` — create, apply (duplicate prevention), ownership checks
   - `convex/bookings.test.ts` — status transitions, ownership validation, cancel logic
   - `convex/wallet.test.ts` — balance checks, escrow hold/release, insufficient funds
   - `convex/commission.test.ts` — rate calculation by plan, commission deduction
4. **Write component tests** for reusable components:
   - `components/ui/primary-button.test.tsx` — renders, press handler, disabled state
   - `components/ui/onboarding-option-row.test.tsx` — selection, icon rendering
   - `components/booking-card.test.tsx` — status badge display, price formatting
5. **Write integration tests** for critical flows:
   - Auth flow: sign in → redirect to dashboard
   - Driver onboarding: step through all 10 steps, verify store updates
   - Booking flow: create booking → driver accepts → complete → commission applied
6. **Write E2E test setup** (optional stretch):
   - Configure Detox or Maestro for E2E
   - Write one E2E test: sign in → select role → complete onboarding → land on dashboard

## Test Structure

```
__tests__/
  convex/           # Unit tests for Convex functions
  components/       # Component tests
  integration/      # Multi-component flow tests
  e2e/              # End-to-end tests
```

## Rules

- Test business logic first (Convex functions are the foundation)
- Test edge cases: unauthorized access, duplicate actions, insufficient funds
- Aim for 80%+ coverage on Convex functions
- Run `bun run typecheck` and `bun run lint` — fix all errors
