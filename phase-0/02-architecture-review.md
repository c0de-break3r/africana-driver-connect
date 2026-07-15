# Architecture Review — Africana Driver Connect

> Generated: 2026-07-10 · Read-only review, no code modified.  
> References: AGENTS.md, phase-0/00-project-inspection.md

---

## 1. SOLID Principles

### Single Responsibility Principle (SRP)

**Rating: ⚠️ Partially Violated**

| Area                          | Verdict     | Evidence                                                                                                                                                                                                |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route layouts (`_layout.tsx`) | ✅ Good     | Each layout does one thing: auth guard + Stack                                                                                                                                                          |
| Zustand stores                | ⚠️ Mixed    | `useRoleStore` = single responsibility ✅. `useDriverOnboardingStore` (152 lines) mixes step navigation, form data, verification state, and auth progress — borderline too many responsibilities        |
| Screen files                  | ❌ Violated | `closing-reflection.tsx` (922 lines) contains question definitions, multi-phase state machine, chart rendering, animation orchestration, and navigation logic — at least 4 responsibilities in one file |
| `foundational-questions.tsx`  | ❌ Violated | (509 lines) contains question definitions for 4 roles, rendering logic, animation setup, and answer persistence in one file                                                                             |
| `lib/metamap.ts`              | ✅ Good     | Single concern: MetaMap SDK wrapper                                                                                                                                                                     |
| `lib/routing.ts`              | ✅ Good     | Single concern: post-auth route resolution                                                                                                                                                              |
| Convex functions              | ✅ Good     | Each file maps to one domain (users, drivers, owners, vehicles, jobs)                                                                                                                                   |

**Worst SRP offenders:**

1. `closing-reflection.tsx` — 922 lines, 4+ responsibilities
2. `foundational-questions.tsx` — 509 lines, embeds data + logic + animation + persistence
3. `sign-up.tsx` — 663 lines, combines form UI, validation, Clerk integration, and navigation

### Open/Closed Principle (OCP)

**Rating: ⚠️ Needs Improvement**

- **Role handling is hardcoded** — `getPostAuthRoute()` in `lib/routing.ts` uses a switch/case on 4 literal role strings. Adding a 5th role requires modifying this function, `useRoleStore.ts`, the Convex schema union, and `role-select.tsx`. Not extensible.
- **Question definitions are inline** — `foundational-questions.tsx` and `closing-reflection.tsx` hardcode question arrays inside screen files. Adding/modifying questions requires editing screen code. Should be data-driven from `data/` directory.
- **Convex schema unions are closed** — `role`, `verificationStatus`, `booking.status` use `v.union(v.literal(...))`. Adding new values requires schema migration.

### Liskov Substitution Principle (LSP)

**Rating: ✅ Not Applicable**

No inheritance hierarchies. Composition-based architecture with hooks and stores. LSP is not relevant here.

### Interface Segregation Principle (ISP)

**Rating: ⚠️ Partially Violated**

- **Store consumers import entire stores** — screens using `useDriverOnboardingStore` pull in all 15+ fields and 12 actions even when they only need one field. Zustand selectors help at runtime but the type imports are monolithic.
- **`useConvexUser` returns a fixed shape** — consumers who only need `convexUser` still get `isAuthLoaded` and `isSynced`. Minor issue.

### Dependency Inversion Principle (DIP)

**Rating: ❌ Violated**

- **Screens depend directly on concrete stores** — every screen imports `useDriverOnboardingStore` or `useOnboardingAnswersStore` directly. No abstraction layer, no dependency injection.
- **Screens depend directly on Clerk hooks** — auth screens call `useSignIn()`, `useSignUp()`, `useSSO()` directly. If auth provider changes, every auth screen must be rewritten.
- **Convex mutations called directly from hooks** — `useConvexUser.ts` imports `api.users.createOrUpdateFromClerk` directly. No repository pattern or service layer.
- **No interfaces or protocols** — the entire codebase uses concrete types. While pragmatic for a learning project, it makes testing difficult (no way to mock stores or Convex without module-level mocking).

---

## 2. DRY — Duplicate Code Analysis

**Total estimated duplication: ~480 lines across 32+ files**

### Severity Ranking

| Rank | Pattern                                   | Lines Duplicated | Files Affected | Severity  |
| ---- | ----------------------------------------- | ---------------- | -------------- | --------- |
| 1    | **Entrance animation block**              | ~240 lines       | 8 files        | 🔴 High   |
| 2    | **Top bar (back + dots + spacer)**        | ~150 lines       | 10 files       | 🔴 High   |
| 3    | **Auth layout guard**                     | ~60 lines        | 4 files        | 🟡 Medium |
| 4    | **Back button with `canGoBack` fallback** | ~30 lines        | 10 files       | 🟢 Low    |

### Detailed Breakdown

**A. Entrance Animation (~240 lines, 8 files)**

Every onboarding screen contains an identical `useEffect` block creating `Animated.parallel`/`Animated.sequence`/`Animated.timing` for content fade-in + footer slide-up:

```
foundational-questions.tsx (lines ~114–153)
bombshell.tsx
closing-reflection.tsx
role-question.tsx
driver-step-shell.tsx (lines ~50–89)
experience.tsx, employment.tsx, goals.tsx (via driver-step-shell)
```

**Root cause:** Animation logic was copy-pasted rather than extracted into a `useEntranceAnimation()` hook.

**B. Top Bar (~150 lines, 10 files)**

Identical `<View style={styles.topBar}>` with back button + `<PageDots>` + spacer:

```
foundational-questions.tsx, bombshell.tsx, closing-reflection.tsx,
role-question.tsx, and all driver-step-shell.tsx consumers (6 files)
```

**Root cause:** No shared `OnboardingTopBar` component.

**C. Auth Layout Guard (~60 lines, 4 files)**

Character-for-character identical layout guards in:

```
(driver)/_layout.tsx, (owner)/_layout.tsx, (client)/_layout.tsx, (corporate)/_layout.tsx
```

Each is 16 lines of identical code: `useAuth()` → `isSignedIn` check → `<Redirect>` → `<Stack>`.

**Root cause:** No shared `AuthLayoutGuard` component or HOC.

**D. Back Button Fallback (~30 lines, 10 files)**

`router.canGoBack() ? router.back() : router.replace(fallbackRoute)` repeated in every screen.

**Root cause:** No shared `useSafeBack()` hook.

---

## 3. KISS — Simplicity Analysis

**Rating: ✅ Mostly Simple, Some Exceptions**

### What's Simple (Good)

| Area                    | Why It Works                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| File-based routing      | Expo Router eliminates routing configuration entirely             |
| Zustand stores          | Dead-simple state management, no boilerplate                      |
| Convex schema           | Clean, readable, well-indexed                                     |
| Role-based route groups | Clear separation — open `(driver)` folder, see driver screens     |
| `lib/routing.ts`        | 31 lines, does one thing clearly                                  |
| Component API surface   | `PrimaryButton`, `OnboardingOptionRow`, `PageDots` — simple props |

### What's Overcomplicated

| Area                                 | Problem                                                                                                                                          | Simpler Alternative                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `closing-reflection.tsx` (922 lines) | Multi-phase state machine with inline question definitions, chart rendering, 3 different layouts in one file                                     | Split into `ClosingQuestion`, `ClosingChart`, `ClosingSummary` sub-components + move questions to `data/`        |
| Dual onboarding stores               | `useDriverOnboardingStore` AND `useOnboardingAnswersStore` both track `yearsExperience` and `employmentStatus`                                   | Merge into one store, or clearly define which store "owns" each field                                            |
| MetaMap integration                  | `lib/metamap.ts` uses native SDK with `NativeEventEmitter` patching, lazy module loading, try/catch wrappers — all to work around missing module | Migrate to Convex REST action (already planned). Eliminates 119 lines of client-side workaround                  |
| `foundational-questions.tsx`         | 509 lines for what is essentially "show 2 questions per role"                                                                                    | Data-driven approach: define questions in `data/onboarding-questions.ts`, render with generic question component |

### What's Under-Abstractstrated (Too Simple)

| Area                | Problem                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| No service layer    | Screens call Convex mutations directly — no error handling, retry, or loading state abstraction                                        |
| No form abstraction | Each auth screen (sign-in, sign-up, forgot-password) implements its own form validation, error display, and loading state from scratch |
| No animation hooks  | Every screen re-implements entrance animations instead of using a shared hook or `react-native-reanimated` layout animations           |

---

## 4. YAGNI — Unused / Dead / Speculative Code

### Unused Components (Safe to Delete)

| Component         | File                      | Lines | Status                                                                    |
| ----------------- | ------------------------- | ----- | ------------------------------------------------------------------------- |
| `SecondaryButton` | `ui/secondary-button.tsx` | 79    | ❌ Zero imports                                                           |
| `Card`            | `ui/card.tsx`             | 21    | ❌ Zero imports                                                           |
| `FadeInText`      | `ui/fade-in-text.tsx`     | 68    | ❌ Zero imports (imported in closing-reflection but may be dead — verify) |

**Total dead code: ~168 lines**

### Speculative / Placeholder Code

| Item                       | Location                         | Lines | Assessment                      |
| -------------------------- | -------------------------------- | ----- | ------------------------------- |
| `(owner)/` route group     | Layout only, no screens          | 16    | Shell — needed for future, keep |
| `(client)/` route group    | Layout only, no screens          | 16    | Shell — needed for future, keep |
| `(corporate)/` route group | Layout only, no screens          | 16    | Shell — needed for future, keep |
| `convex/bookings.ts`       | Placeholder comments             | 11    | Keep — schema already defined   |
| `convex/ratings.ts`        | Placeholder comments             | 9     | Keep — schema already defined   |
| `convex/notifications.ts`  | Placeholder comments             | 10    | Keep — schema already defined   |
| `convex/metamap.ts`        | REST API docs                    | 21    | Keep — migration planned        |
| `trial.tsx`                | Placeholder for non-driver roles | 74    | Keep — functional placeholder   |

### Dead Dependencies

| Package                        | `package.json` | Actually Used                                  | Assessment                                                 |
| ------------------------------ | -------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| `react-native-reanimated`      | ✅ Installed   | ❌ Not used (all animations use RN `Animated`) | Could be leveraged or removed                              |
| `react-native-gesture-handler` | ✅ Installed   | ❌ Not used                                    | Keep — likely needed for future gesture-based interactions |

### Speculative Schema Fields

The Convex schema has fields that may never be used:

- `bookings.disputed` status — no dispute resolution system planned yet
- `notifications.type: v.string()` — untyped, could be a union
- `verifications.provider: v.string()` — only MetaMap exists

**Verdict:** Minimal YAGNI violations. The unused components should be deleted. Everything else is justified by the roadmap.

---

## 5. Separation of Concerns

**AGENTS.md rule:** _"Business logic should never live inside screens. Screens should remain as thin as possible."_

### Current State

| Layer          | Expected Responsibility               | Actual State                                                                                                  |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Screens**    | Compose components, call hooks/stores | ⚠️ Mixed — some screens are thin (driver home), others are thick (closing-reflection, foundational-questions) |
| **Components** | Reusable UI                           | ✅ Good — `PrimaryButton`, `OnboardingOptionRow`, `DriverStepShell` are pure UI                               |
| **Hooks**      | Business logic abstraction            | ❌ Underused — only `useConvexUser` exists (and it's never called)                                            |
| **Stores**     | Global state                          | ✅ Good — Zustand stores are clean and well-typed                                                             |
| **Convex**     | Backend business logic                | ⚠️ Implemented but disconnected — UI never calls Convex functions                                             |

### Specific Violations

**Thick screens (business logic in screens):**

1. **`foundational-questions.tsx`** — contains question definitions, answer validation logic, role-conditional branching, and store persistence logic directly in the screen component
2. **`closing-reflection.tsx`** — contains a 3-phase state machine, chart data computation, goal categorization by role, and navigation logic
3. **`sign-up.tsx`** (663 lines) — contains form validation rules, error message logic, and Clerk session creation directly

**What should be extracted:**

| Currently in Screen    | Should Be In                    | Rationale                           |
| ---------------------- | ------------------------------- | ----------------------------------- |
| Question definitions   | `data/onboarding-questions.ts`  | Data, not UI logic                  |
| Answer validation      | `hooks/useOnboardingForm.ts`    | Reusable business logic             |
| Entrance animations    | `hooks/useEntranceAnimation.ts` | Eliminates 240 lines of duplication |
| Clerk form handling    | `hooks/useAuthForm.ts`          | Reusable auth pattern               |
| Role-conditional logic | `hooks/useRoleBasedContent.ts`  | Separates data from presentation    |

### Data Flow Analysis

**Intended flow (AGENTS.md):** Screen → Component → Hook → Store → Convex

**Actual flow:**

```
Screen → Store (Zustand)         [onboarding screens]
Screen → Clerk (direct)          [auth screens]
Screen → Store → ???             [driver dashboard — Convex never called]
```

**Missing link:** The Store → Convex connection doesn't exist. `useConvexUser` was designed to bridge this gap but is never mounted.

---

## 6. Folder Organization

### AGENTS.md Expected Structure vs. Reality

| Expected Directory  | Exists?    | Contents                             | Match?                                       |
| ------------------- | ---------- | ------------------------------------ | -------------------------------------------- |
| `app/(auth)/`       | ✅         | 4 screens + layout                   | ✅                                           |
| `app/(onboarding)/` | ✅         | 18 screens + driver sub-group        | ✅                                           |
| `app/(driver)/`     | ✅         | 10 screens + tab layout              | ✅                                           |
| `app/(owner)/`      | ✅         | Layout only                          | ✅ (shell)                                   |
| `app/(client)/`     | ✅         | Layout only                          | ✅ (shell)                                   |
| `app/(corporate)/`  | ✅         | Layout only                          | ✅ (shell)                                   |
| `components/`       | ✅         | 10 files                             | ✅                                           |
| `constants/`        | ✅         | `images.ts`                          | ✅                                           |
| `hooks/`            | ✅         | 1 file (`useConvexUser`)             | ⚠️ Underpopulated                            |
| `store/`            | ✅         | 3 stores                             | ✅                                           |
| `lib/`              | ✅         | 2 files (`routing.ts`, `metamap.ts`) | ✅                                           |
| `types/`            | ✅         | 2 declaration files                  | ✅                                           |
| `data/`             | ❌ Missing | —                                    | ❌ Expected by AGENTS.md                     |
| `assets/`           | ✅         | Images only                          | ⚠️ Partial (no fonts, no organized sub-dirs) |

### Issues

1. **`data/` directory doesn't exist** — AGENTS.md specifies it for hardcoded reference data (vehicle types, driver categories, occasion types). Currently, question definitions and option arrays are inline in screen files.

2. **`hooks/` has 1 file** — the architecture expects hooks to be the primary business logic layer, but only `useConvexUser` exists. No `useEntranceAnimation`, `useSafeBack`, `useOnboardingForm`, etc.

3. **`constants/` has 1 file** — only `images.ts`. Design tokens from `global.css` are not exposed as TypeScript constants.

4. **No `services/` or `api/` layer** — Convex functions are called directly. A service layer would improve testability and error handling.

---

## 7. Navigation

### Route Groups

**Rating: ✅ Well-Structured**

The route group architecture is clean and matches AGENTS.md:

```
(auth)        → Unauthenticated flows (sign-in, sign-up, forgot-password, sso-callback)
(onboarding)  → Pre-auth onboarding (welcome through role-select through closing)
(driver)      → Authenticated driver dashboard + modals
(owner)       → Authenticated owner dashboard (empty shell)
(client)      → Authenticated client dashboard (empty shell)
(corporate)   → Authenticated corporate dashboard (empty shell)
```

### Auth Guards

**Rating: ⚠️ Incomplete**

| Group          | Guard                             | Issue                                                            |
| -------------- | --------------------------------- | ---------------------------------------------------------------- |
| `(auth)`       | ✅ Redirects signed-in users away | Good — uses `getPostAuthRoute()`                                 |
| `(onboarding)` | ❌ No guard                       | Intentional — but means anyone can access onboarding at any time |
| `(driver)`     | ✅ Requires sign-in               | Good — but doesn't check role                                    |
| `(owner)`      | ✅ Requires sign-in               | Good — but doesn't check role                                    |
| `(client)`     | ✅ Requires sign-in               | Good — but doesn't check role                                    |
| `(corporate)`  | ✅ Requires sign-in               | Good — but doesn't check role                                    |

**Critical gap:** Route guards check `isSignedIn` but **not** `role`. A signed-in driver can navigate to `/(owner)/*` or `/(client)/*` directly. There's no role-based access control on the role-specific route groups.

### Deep Link Handling

**Rating: ⚠️ Minimal**

- SSO callback at `(auth)/sso-callback` — handles Clerk OAuth redirects ✅
- `?from=welcome` query param on sign-in — controls back button behavior ✅
- No universal link handling for in-app navigation (e.g., `africanadriverconnect://driver/jobs/123`)
- No notification deep link routing

### Navigation Patterns

**Rating: ✅ Good**

- `router.back()` always guarded with `router.canGoBack()` + fallback
- `router.replace()` used for post-auth navigation (prevents back-stack issues)
- `router.push()` used for modal screens
- Tab navigation via Expo Router tabs layout

---

## 8. State Management

### Store Architecture

```
useRoleStore (44 lines)
├── role: UserRole | null
├── onboardingComplete: boolean
└── Storage: africana-role-store

useDriverOnboardingStore (152 lines)
├── currentStep, yearsExperience, employmentStatus, driverGoal
├── fullLegalName, dateOfBirth, licenseClass, vehicleTypes[]
├── preferredJobType, preferredLocation
├── licenseVerificationStatus, licenseVerificationJobId, licenseVerificationError
├── verificationMethod, onboardingComplete, profileDocumentsUploaded
└── Storage: africana-driver-onboarding

useOnboardingAnswersStore (134 lines)
├── yearsExperience, employmentStatus       ← DUPLICATE
├── vehicleCount, ownerPainPoint
├── preferredOccasionType, bookingFrequency
├── orgSize, corporateChallenge
├── commitment, lastCompletedScreen
└── Storage: africana-onboarding-answers
```

### Issues

**1. Field Duplication**

`yearsExperience` and `employmentStatus` exist in both `useDriverOnboardingStore` and `useOnboardingAnswersStore`. Both are persisted to AsyncStorage. If a user updates `yearsExperience` in the driver flow but the foundational questions flow reads from the other store, they get stale data.

**Recommendation:** Make `useOnboardingAnswersStore` the single owner of onboarding Q&A data. Have `useDriverOnboardingStore` read from it instead of duplicating.

**2. `onboardingComplete` exists in two stores**

Both `useRoleStore` and `useDriverOnboardingStore` have an `onboardingComplete` boolean. Which one is authoritative?

**3. No Convex sync**

All three stores persist to AsyncStorage only. The intended Convex sync via `useConvexUser` → `users.createOrUpdateFromClerk` is never triggered. User data lives only on-device.

**4. No derived state or computed values**

Stores use plain setters. No selectors, no computed state, no middleware for side effects. This is fine for current complexity but won't scale.

### Persistence Strategy

| Store                       | Persisted       | Strategy   | Risk                                                    |
| --------------------------- | --------------- | ---------- | ------------------------------------------------------- |
| `useRoleStore`              | ✅ AsyncStorage | Full state | Low                                                     |
| `useDriverOnboardingStore`  | ✅ AsyncStorage | Full state | Medium — sensitive data (name, DOB) stored in plaintext |
| `useOnboardingAnswersStore` | ✅ AsyncStorage | Full state | Low                                                     |

**Security note:** `fullLegalName` and `dateOfBirth` are stored in AsyncStorage unencrypted. For a production app, these should use encrypted storage or be kept server-side only.

---

## 9. Scalability Assessment

### Can this architecture support 4 role dashboards?

**Rating: ⚠️ Structurally Ready, Not Implemented**

| Capability                     | Current                | Scalable?                                                        |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------- |
| Route groups per role          | ✅ 4 groups exist      | ✅ Yes — clean separation                                        |
| Auth guards per role           | ✅ 4 layouts exist     | ✅ Yes — but identical, should be shared                         |
| Role-specific stores           | ❌ Only driver has one | ⚠️ Need `useOwnerOnboardingStore`, `useClientBookingStore`, etc. |
| Role-specific Convex functions | ⚠️ Driver + Owner only | ⚠️ Client and corporate not implemented                          |
| Tab navigation per role        | ❌ Driver only         | ⚠️ Owner, client, corporate will need their own tab layouts      |

**Scaling risk:** If each role gets its own onboarding store following the current pattern, we'll have 4 large stores with overlapping fields. Better to consolidate into a shared onboarding store with role-specific extensions.

### Can this architecture support real-time bookings?

**Rating: ⚠️ Schema Ready, Implementation Missing**

| Capability              | Current                     | Gap                                                                             |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| Convex `bookings` table | ✅ Schema defined           | No queries, mutations, or actions                                               |
| Real-time subscriptions | ✅ Convex supports natively | No `useQuery(api.bookings.*)` anywhere                                          |
| Booking state machine   | ❌ Not implemented          | Need status transitions: pending → confirmed → in_progress → completed          |
| Push notifications      | ❌ Not implemented          | Need `expo-notifications` + FCM setup                                           |
| Live GPS tracking       | ❌ Not implemented          | Need `react-native-maps` + location permissions                                 |
| Payment processing      | ❌ Not implemented          | Need payment abstraction layer (AGENTS.md: Paystack, Flutterwave, Stripe, MoMo) |

**Critical path:** Real-time bookings require:

1. Convex booking functions (queries + mutations)
2. Clerk→Convex auth sync (currently broken)
3. Push notification infrastructure
4. Payment provider integration

### Can this architecture support payments?

**Rating: ❌ Not Ready**

AGENTS.md requires a payment abstraction layer supporting 6 providers (Paystack, Flutterwave, Stripe, MTN MoMo, Vodafone Cash, AirtelTigo Money). Currently:

- No `lib/payments.ts` exists
- No payment-related Convex functions
- No payment-related schema tables (escrow, transactions, wallet)
- No payment provider SDK installed

**What's needed:**

- Payment abstraction interface in `lib/payments.ts`
- Convex actions for payment provider calls (server-side only)
- Schema additions: `transactions`, `wallets`, `escrow`
- Provider-specific adapters

### Scalability Bottlenecks

| Bottleneck                                      | Impact                             | When It Breaks                            |
| ----------------------------------------------- | ---------------------------------- | ----------------------------------------- |
| AsyncStorage-only persistence                   | Data loss on device change         | Immediately — no cloud sync               |
| No role-based access control                    | Users can access wrong role routes | Immediately — no guard                    |
| Monolithic screen files                         | Unmaintainable as features grow    | When closing-reflection hits 1000+ lines  |
| Direct Convex calls from UI                     | No error handling, retry, caching  | When network issues cause silent failures |
| Single Convex `getVerified` query without index | O(n) scan of all drivers           | When driver count exceeds ~1000           |

---

## Summary: Architecture Scorecard

| Principle                  | Score | Key Issue                                                       |
| -------------------------- | ----- | --------------------------------------------------------------- |
| **SOLID**                  | 5/10  | SRP violated in 3 large screens; no dependency inversion        |
| **DRY**                    | 4/10  | ~480 lines duplicated; animation + top bar patterns copy-pasted |
| **KISS**                   | 7/10  | Mostly simple; 2-3 overcomplicated screens                      |
| **YAGNI**                  | 8/10  | Minimal dead code; 3 unused components to delete                |
| **Separation of Concerns** | 5/10  | Business logic leaks into screens; hooks layer underdeveloped   |
| **Folder Organization**    | 7/10  | Matches AGENTS.md mostly; missing `data/` directory             |
| **Navigation**             | 7/10  | Clean route groups; missing role-based access control           |
| **State Management**       | 6/10  | Clean stores but field duplication and no cloud sync            |
| **Scalability**            | 4/10  | Schema is ready; everything else needs implementation           |

**Overall Architecture Grade: C+ (6/10)**

The foundation is sound — route groups, store structure, and Convex schema are well-designed. The primary issues are:

1. The Clerk→Convex bridge is broken (critical blocker)
2. Business logic lives in screens instead of hooks/services
3. Significant code duplication in onboarding screens
4. No role-based access control on route groups
5. No service/abstraction layer between UI and backend

---

## Recommended Priority Fixes

| #   | Fix                                                 | Effort | Impact                              |
| --- | --------------------------------------------------- | ------ | ----------------------------------- |
| 1   | Wire `useConvexUser` into root layout               | Low    | 🔴 Unblocks all cloud persistence   |
| 2   | Extract `AuthLayoutGuard` shared component          | Low    | 🟡 Eliminates 60 lines duplication  |
| 3   | Extract `useEntranceAnimation()` hook               | Low    | 🔴 Eliminates 240 lines duplication |
| 4   | Add role-based access control to route guards       | Medium | 🔴 Security fix                     |
| 5   | Create `data/` directory, move question definitions | Medium | 🟡 SRP fix + DRY                    |
| 6   | Resolve store field duplication                     | Medium | 🟡 Single source of truth           |
| 7   | Delete 3 unused components                          | Low    | 🟢 Clean codebase                   |
| 8   | Split `closing-reflection.tsx`                      | Medium | 🟡 SRP fix                          |
