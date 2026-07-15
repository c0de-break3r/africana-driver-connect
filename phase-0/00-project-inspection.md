# Project Inspection Report — Africana Driver Connect

> Generated: 2026-07-10 · Read-only inspection, no code modified.

---

## 1. Architecture

| Layer        | Technology                           | Version                 |
| ------------ | ------------------------------------ | ----------------------- |
| Framework    | Expo (managed workflow + dev client) | 57.0.6                  |
| Runtime      | React Native                         | 0.86.0                  |
| Language     | TypeScript                           | 6.0.3                   |
| Routing      | Expo Router (file-based)             | 57.0.6                  |
| Styling      | NativeWind + Tailwind CSS            | 5.0.0-preview.4 / 4.3.2 |
| State        | Zustand (AsyncStorage-persisted)     | 5.0.14                  |
| Auth         | Clerk (`@clerk/expo`)                | 3.7.4                   |
| Backend      | Convex (real-time DB + functions)    | 1.42.2                  |
| Verification | MetaMap native SDK + expo-camera     | 5.4.44 / 57.0.2         |
| Animations   | React Native `Animated` API          | —                       |
| Haptics      | expo-haptics                         | 57.0.1                  |

**Patterns used:**

- Screen → Component → Hook → Store → Convex (intended, partially implemented)
- Auth guard via layout `<Redirect>` in each route group
- Clerk→Convex user sync via `useConvexUser` hook
- Role-based routing via `useRoleStore` + `lib/routing.ts`

**AGENTS.md compliance:**

- ✅ Role-based route groups: `(auth)`, `(onboarding)`, `(driver)`, `(owner)`, `(client)`, `(corporate)`
- ✅ Clerk for auth — no custom auth
- ✅ Zustand for global client state
- ✅ Hardcoded reference data (no database for vehicle types, etc.)
- ✅ Centralized image imports via `constants/images.ts`
- ⚠️ NativeWind rule violation — most screens use `StyleSheet` instead of NativeWind
- ⚠️ MetaMap client ID exposed via `EXPO_PUBLIC_` prefix (AGENTS.md says "Never expose secrets in the frontend")

---

## 2. Folder Structure

```
africana-driver-connect/
├── app.json                         (62 lines)
├── package.json                     (66 lines)
├── tsconfig.json                    (19 lines)
├── convex/                          (932 lines total)
│   ├── _generated/                  (auto-generated types)
│   ├── schema.ts                    (215 lines — 10 tables)
│   ├── auth.ts                      (43 lines — getCurrentUser, getCurrentUserOrThrow)
│   ├── users.ts                     (145 lines — CRUD + Clerk sync)
│   ├── drivers.ts                   (166 lines — profile + verification)
│   ├── owners.ts                    (56 lines — profile CRUD)
│   ├── vehicles.ts                  (51 lines — register + list)
│   ├── jobs.ts                      (116 lines — post, apply, list)
│   ├── bookings.ts                  (11 lines — placeholder)
│   ├── ratings.ts                   (9 lines — placeholder)
│   ├── notifications.ts             (10 lines — placeholder)
│   └── metamap.ts                   (21 lines — placeholder + REST docs)
├── plugins/
│   ├── with-metamap-fixes.js        (EAS config plugin for allowBackup + OkHttp)
│   └── patch-clerk-expo.js          (postinstall Expo Go compatibility patch)
├── prompts/                         (34 named prompt files, 00–33)
├── src/                             (8,839 lines total)
│   ├── global.css                   (57 lines — design tokens)
│   ├── app/                         (43 route files, ~7,300 lines)
│   │   ├── _layout.tsx              (31 lines — root: ConvexProvider > ClerkProvider)
│   │   ├── index.tsx                (10 lines — redirect to onboarding)
│   │   ├── (auth)/                  (4 screens + layout, 1,684 lines)
│   │   │   ├── _layout.tsx          (25 lines — auth guard + redirect)
│   │   │   ├── sign-in.tsx          (465 lines)
│   │   │   ├── sign-up.tsx          (663 lines)
│   │   │   ├── forgot-password.tsx  (480 lines)
│   │   │   └── sso-callback.tsx     (112 lines)
│   │   ├── (onboarding)/            (18 screens + 2 layouts, ~4,350 lines)
│   │   │   ├── _layout.tsx          (6 lines — Stack, no header)
│   │   │   ├── welcome.tsx          (427 lines — carousel + auto-advance)
│   │   │   ├── role-question.tsx    (269 lines)
│   │   │   ├── role-select.tsx      (276 lines — role fork)
│   │   │   ├── foundational-questions.tsx (509 lines — role-branched Q&A)
│   │   │   ├── bombshell.tsx        (459 lines)
│   │   │   ├── closing-reflection.tsx (921 lines — largest file)
│   │   │   ├── trial.tsx            (74 lines — placeholder for non-driver roles)
│   │   │   └── driver/              (10 screens + layout)
│   │   │       ├── _layout.tsx      (6 lines)
│   │   │       ├── experience.tsx   (49 lines)
│   │   │       ├── employment.tsx   (48 lines)
│   │   │       ├── goals.tsx        (48 lines)
│   │   │       ├── license.tsx      (234 lines)
│   │   │       ├── license-verify.tsx (574 lines — camera + MetaMap)
│   │   │       ├── vehicle.tsx      (75 lines)
│   │   │       ├── job-type.tsx     (49 lines)
│   │   │       ├── location.tsx     (138 lines)
│   │   │       └── otp.tsx          (179 lines)
│   │   ├── (driver)/                (10 screens + tab layout, ~1,264 lines)
│   │   │   ├── _layout.tsx          (16 lines — auth guard)
│   │   │   ├── (tabs)/
│   │   │   │   ├── _layout.tsx      (110 lines — bottom tabs)
│   │   │   │   ├── index.tsx        (215 lines — home dashboard)
│   │   │   │   ├── jobs.tsx         (128 lines)
│   │   │   │   ├── messages.tsx     (80 lines)
│   │   │   │   ├── notifications.tsx (152 lines)
│   │   │   │   └── profile.tsx      (207 lines)
│   │   │   ├── complete-profile.tsx (100 lines)
│   │   │   ├── settings.tsx         (66 lines)
│   │   │   ├── help.tsx             (65 lines)
│   │   │   ├── wallet.tsx           (65 lines)
│   │   │   └── ratings.tsx          (65 lines)
│   │   ├── (owner)/                 (layout only — no screens)
│   │   ├── (client)/                (layout only — no screens)
│   │   └── (corporate)/             (layout only — no screens)
│   ├── components/                  (10 files, ~689 lines)
│   │   ├── ui/
│   │   │   ├── index.ts             (10 lines — barrel exports)
│   │   │   ├── card.tsx             (21 lines)
│   │   │   ├── fade-in-text.tsx     (68 lines)
│   │   │   ├── onboarding-option-row.tsx (143 lines)
│   │   │   ├── page-dots.tsx        (52 lines)
│   │   │   ├── primary-button.tsx   (84 lines)
│   │   │   ├── progress-bar.tsx     (76 lines)
│   │   │   ├── screen-container.tsx (19 lines)
│   │   │   └── secondary-button.tsx (79 lines)
│   │   └── driver-step-shell.tsx    (209 lines — shared onboarding shell)
│   ├── store/                       (3 stores, 326 lines)
│   │   ├── useRoleStore.ts          (44 lines)
│   │   ├── useDriverOnboardingStore.ts (152 lines)
│   │   └── useOnboardingAnswersStore.ts (134 lines)
│   ├── hooks/
│   │   └── useConvexUser.ts         (51 lines — Clerk→Convex sync)
│   ├── lib/
│   │   ├── routing.ts               (31 lines — post-auth route mapping)
│   │   └── metamap.ts               (119 lines — SDK wrapper + theme)
│   ├── constants/
│   │   └── images.ts                (27 lines — centralized image exports)
│   └── types/
│       ├── assets.d.ts              (29 lines — SVG/image module declarations)
│       └── metamap.d.ts             (16 lines — MetaMap type augmentation)
```

---

## 3. Navigation

**Expo Router setup:**

- File-based routing with `app/` directory
- `scheme: "africanadriverconnect"` for deep links
- `typedRoutes: true` experiment enabled

**Route groups:**

| Group          | Auth Guard            | Redirect Target                          | Screens                |
| -------------- | --------------------- | ---------------------------------------- | ---------------------- |
| `(auth)`       | ✅ Signed-in → away   | Post-auth route via `getPostAuthRoute()` | 4                      |
| `(onboarding)` | ❌ Open               | —                                        | 18                     |
| `(driver)`     | ✅ Signed-in required | `/(auth)/sign-in`                        | 10 (5 tabs + 5 modals) |
| `(owner)`      | ✅ Signed-in required | `/(auth)/sign-in`                        | 0 (layout only)        |
| `(client)`     | ✅ Signed-in required | `/(auth)/sign-in`                        | 0 (layout only)        |
| `(corporate)`  | ✅ Signed-in required | `/(auth)/sign-in`                        | 0 (layout only)        |

**Post-auth routing** (`lib/routing.ts`):

- `driver` → `/(driver)` (tab dashboard)
- `owner/client/corporate` → `/(onboarding)/trial` (placeholder)
- No role → `/(onboarding)/role-select`

**Back navigation:**

- All `router.back()` calls guarded with `router.canGoBack()` + fallback routes
- Driver screens fall back to `/(driver)`
- Onboarding screens fall back to `/(onboarding)/welcome`

**Deep links:**

- SSO callback at `(auth)/sso-callback` handles Clerk OAuth redirects
- `?from=welcome` param on sign-in controls back button behavior

---

## 4. Components

| Component             | File                           | Lines | Used In                                                             | Status        |
| --------------------- | ------------------------------ | ----- | ------------------------------------------------------------------- | ------------- |
| `ScreenContainer`     | `ui/screen-container.tsx`      | 19    | 8 screens                                                           | ✅ Active     |
| `PrimaryButton`       | `ui/primary-button.tsx`        | 84    | 12+ screens                                                         | ✅ Active     |
| `PageDots`            | `ui/page-dots.tsx`             | 52    | welcome, role-question, foundational-questions, driver-step-shell   | ✅ Active     |
| `OnboardingOptionRow` | `ui/onboarding-option-row.tsx` | 143   | foundational-questions, bombshell, closing-reflection, driver steps | ✅ Active     |
| `ProgressBar`         | `ui/progress-bar.tsx`          | 76    | driver-step-shell (via PageDots)                                    | ✅ Active     |
| `DriverStepShell`     | `driver-step-shell.tsx`        | 209   | 8 driver onboarding steps                                           | ✅ Active     |
| `SecondaryButton`     | `ui/secondary-button.tsx`      | 79    | —                                                                   | ❌ **Unused** |
| `Card`                | `ui/card.tsx`                  | 21    | —                                                                   | ❌ **Unused** |
| `FadeInText`          | `ui/fade-in-text.tsx`          | 68    | —                                                                   | ❌ **Unused** |

---

## 5. Stores

### `useRoleStore` (44 lines, persisted)

- **Fields:** `role: UserRole | null`, `onboardingComplete: boolean`
- **Actions:** `setRole()`, `setOnboardingComplete()`, `reset()`
- **Storage key:** `africana-role-store`

### `useDriverOnboardingStore` (152 lines, persisted)

- **Fields:** `currentStep`, `yearsExperience`, `employmentStatus`, `driverGoal`, `fullLegalName`, `dateOfBirth`, `licenseClass`, `vehicleTypes[]`, `preferredJobType`, `preferredLocation`, `licenseVerificationStatus`, `licenseVerificationJobId`, `licenseVerificationError`, `verificationMethod`, `onboardingComplete`, `profileDocumentsUploaded`
- **Actions:** `setStep()`, `setExperience()`, `setEmploymentStatus()`, `setDriverGoal()`, `setLicenseInfo()`, `toggleVehicleType()`, `setPreferredJobType()`, `setPreferredLocation()`, `setVerificationMethod()`, `setLicenseVerificationResult()`, `markOnboardingComplete()`, `markProfileDocumentsUploaded()`, `reset()`
- **Storage key:** `africana-driver-onboarding`

### `useOnboardingAnswersStore` (134 lines, persisted)

- **Fields:** `yearsExperience`, `employmentStatus`, `vehicleCount`, `ownerPainPoint`, `preferredOccasionType`, `bookingFrequency`, `orgSize`, `corporateChallenge`, `commitment`, `lastCompletedScreen`
- **Actions:** `setDriverAnswers()`, `setOwnerAnswers()`, `setClientAnswers()`, `setCorporateAnswers()`, `setCommitment()`, `setLastCompletedScreen()`, `reset()`
- **Storage key:** `africana-onboarding-answers`

**Issue:** `useDriverOnboardingStore` and `useOnboardingAnswersStore` have **overlapping fields** (`yearsExperience`, `employmentStatus`). Both are persisted, creating potential sync issues.

---

## 6. Business Logic

**Current pattern adherence (Screen → Component → Hook → Store → Convex):**

| Screen Type      | Uses Components  | Uses Hooks      | Uses Store | Calls Convex |
| ---------------- | ---------------- | --------------- | ---------- | ------------ |
| Auth screens     | ❌ Inline UI     | ❌ Direct Clerk | ❌         | ❌           |
| Onboarding       | ✅ UI components | ❌              | ✅ Zustand | ❌           |
| Driver dashboard | ✅ UI components | ❌              | ✅ Zustand | ❌           |

**Findings:**

- Auth screens use Clerk hooks directly (`useSignIn`, `useSSO`) — no abstraction layer
- `useConvexUser` hook exists but is **not called anywhere** — the Clerk→Convex sync is never triggered
- Driver onboarding saves to Zustand but never calls `convex/drivers.createProfile`
- Role selection saves to Zustand but never calls `convex/users.updateRole`
- The Convex functions are fully implemented but **disconnected** from the UI

---

## 7. Clerk Integration

**Provider hierarchy:** `ConvexProvider > ClerkProvider > Stack` (root layout)

**Auth screens:**

- `sign-in.tsx` — email/password + Google SSO + forgot password link
- `sign-up.tsx` — email/password registration
- `forgot-password.tsx` — password reset flow
- `sso-callback.tsx` — OAuth deep link handler

**Auth guard:** `(auth)/_layout.tsx` redirects signed-in users to their post-auth route

**Patch:** `scripts/patch-clerk-expo.js` runs on postinstall for Expo Go compatibility

**Issues:**

- No `useConvexUser` call in any layout — Clerk→Convex sync never runs
- No auth token bridging between Clerk and Convex (Clerk JWT not passed to Convex)

---

## 8. Convex Integration

**Schema (10 tables):**

| Table             | Fields                                                                                                                                                         | Indexes                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `users`           | clerkId, email, name, phone, imageUrl, role, location, onboardingComplete                                                                                      | `by_clerk_id`, `by_role`               |
| `drivers`         | userId, licenseClass, yearsExperience, employmentStatus, driverGoal, vehicleTypes, preferredJobType, preferredLocation, verificationStatus, rating, totalTrips | `by_user`                              |
| `owners`          | userId, companyName, vehicleCount                                                                                                                              | `by_user`                              |
| `vehicles`        | ownerId, make, model, year, type, plateNumber, registrationStatus, documents[]                                                                                 | `by_owner`                             |
| `jobs`            | ownerId, title, description, category, location, payMin, payMax, payCurrency, status                                                                           | `by_owner`, `by_status`, `by_category` |
| `jobApplications` | jobId, driverId, coverNote, status                                                                                                                             | `by_job`, `by_driver`                  |
| `bookings`        | clientId, driverId, vehicleId, occasionType, status, scheduledAt, price, currency, notes                                                                       | `by_client`, `by_driver`               |
| `ratings`         | fromUserId, toUserId, bookingId, score, comment                                                                                                                | `by_to_user`, `by_from_user`           |
| `notifications`   | userId, type, title, body, read                                                                                                                                | `by_user`                              |
| `verifications`   | userId, type, provider, status, providerId, submittedAt, completedAt, rejectionReason                                                                          | `by_user`, `by_provider_id`            |

**Implemented functions:**

- `users.ts` — `getCurrent`, `getByRole`, `createOrUpdateFromClerk`, `updateRole`, `updateOnboardingComplete`, `updateProfile`
- `drivers.ts` — `getByUserId`, `getVerified`, `createProfile`, `updateProfile`, `updateVerificationStatus`
- `owners.ts` — `getByUserId`, `createProfile`
- `vehicles.ts` — `getByOwner`, `register`
- `jobs.ts` — `list`, `getApplications`, `create`, `apply`
- `auth.ts` — `getCurrentUser`, `getCurrentUserOrThrow`

**Placeholder files (comments only):**

- `bookings.ts`, `ratings.ts`, `notifications.ts`, `metamap.ts`

**Issues:**

- `EXPO_PUBLIC_CONVEX_URL` expected but not in `.env` (only Clerk + MetaMap vars present)
- No Clerk→Convex token bridging configured
- `getVerified` drivers query filters in handler, not via index (performance concern at scale)

---

## 9. MetaMap Integration

**Current implementation (`lib/metamap.ts`):**

- Uses `react-native-metamap-sdk` native module
- Client-side `EXPO_PUBLIC_METAMAP_CLIENT_ID` and `EXPO_PUBLIC_METAMAP_FLOW_ID`
- `showMetaMapVerification()` launches the native flow with theme metadata
- `NativeEventEmitter` patched to silence missing `addListener`/`removeListeners` warnings
- Lazy module loading via `getMetaMapSdk()` with try/catch

**Planned migration (`convex/metamap.ts`):**

- REST API flow documented: OAuth → create verification → upload documents → webhook
- Credentials will move to Convex env vars (server-side only)
- Not yet implemented

**Credential exposure issue:**

- `EXPO_PUBLIC_METAMAP_CLIENT_ID` is in `.env` with the `EXPO_PUBLIC_` prefix
- Per AGENTS.md: "Never expose secret keys in the frontend"
- MetaMap client ID should be server-side only (Convex action), not in the app bundle

---

## 10. Design System

**Color tokens (from `global.css`):**

| Token                      | Hex                | Usage                              |
| -------------------------- | ------------------ | ---------------------------------- |
| `--color-background`       | `#FFF8F3` (peach)  | Screen backgrounds                 |
| `--color-foreground`       | `#2C3E5B` (navy)   | Primary text                       |
| `--color-primary`          | `#2C3E5B` (navy)   | Buttons, active tabs               |
| `--color-secondary`        | `#FF7B54` (orange) | Accents, selected states, progress |
| `--color-tertiary`         | `#FFC947` (gold)   | Decorative                         |
| `--color-muted`            | `#F5ECE5`          | Soft backgrounds                   |
| `--color-muted-foreground` | `#6E7E91`          | Secondary text, hints              |
| `--color-accent`           | `#FFB499`          | Highlights                         |
| `--color-card`             | `#FFFFFF`          | Card backgrounds                   |
| `--color-destructive`      | `#EF4444`          | Errors                             |
| `--color-border`           | `#EAE1D9`          | Dividers, borders                  |

**Typography:** Outfit font family (`--font-sans`, `--font-heading`)

**Border radius:** sm (8px), md (12px), lg (16px), xl (24px)

**Shadow:** `--shadow-theme: 0px 10px 30px -8px rgba(15, 23, 42, 0.12)`

**Icon strategy:** `@expo/vector-icons` (Ionicons) for driver UI, emoji icons in onboarding option rows

**Color consistency:** All hardcoded hex values in StyleSheet match the design tokens. No rogue colors found.

---

## 11. Styling Strategy

**Usage ratio:**

| Approach                         | Files                                    | Percentage |
| -------------------------------- | ---------------------------------------- | ---------- |
| `StyleSheet.create()` only       | 32                                       | ~84%       |
| Mixed `StyleSheet` + `className` | 2 (role-select, closing-reflection)      | ~5%        |
| `className` (NativeWind) only    | 3 (card, fade-in-text, screen-container) | ~8%        |
| Inline styles only               | 3 (layouts)                              | ~3%        |

**AGENTS.md compliance:**

- AGENTS.md says: "Use NativeWind tailwindcss classes for styling strictly"
- **Reality:** 84% of files use StyleSheet exclusively
- AGENTS.md exception rule allows StyleSheet for: SafeAreaView, Pressable pressed states, shadows, dynamic styles — which covers most of the StyleSheet usage
- However, many Text, View, and basic layout styles could be NativeWind but aren't

**Verdict:** The styling strategy **violates** the AGENTS.md NativeWind-first rule. Most screens use 100% StyleSheet where NativeWind would work fine for static layouts.

---

## 12. Technical Debt

| #   | Issue                                                                      | Severity  | AGENTS.md Conflict                                                    |
| --- | -------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| 1   | **`useConvexUser` never called** — Clerk→Convex sync doesn't run           | 🔴 High   | Screen→Hook→Store→Convex pattern broken                               |
| 2   | **`EXPO_PUBLIC_METAMAP_CLIENT_ID`** exposed in client bundle               | 🔴 High   | "Never expose secret keys in the frontend"                            |
| 3   | **`EXPO_PUBLIC_CONVEX_URL`** missing from `.env`                           | 🔴 High   | App crashes without it                                                |
| 4   | **Store duplication** — `yearsExperience`/`employmentStatus` in two stores | 🟡 Medium | Single source of truth violated                                       |
| 5   | **84% StyleSheet usage** despite NativeWind-first rule                     | 🟡 Medium | "Use NativeWind tailwindcss classes for styling strictly"             |
| 6   | **3 unused components** (SecondaryButton, Card, FadeInText)                | 🟢 Low    | "Do not create tiny one-off components too early"                     |
| 7   | **Animated API** used everywhere instead of Reanimated (already installed) | 🟢 Low    | Performance concern for complex animations                            |
| 8   | **Onboarding disconnected from Convex** — all data in Zustand only         | 🟡 Medium | Data persists only locally, not in cloud                              |
| 9   | **closing-reflection.tsx is 921 lines** — largest screen file              | 🟢 Low    | Code simplicity                                                       |
| 10  | **No Clerk→Convex auth token bridging**                                    | 🟡 Medium | Convex auth helpers rely on `ctx.auth` but no JWT provider configured |

---

## 13. Duplicate Code

### A. Entrance animation pattern (~30 lines each, 8 files)

Identical `Animated.parallel/sequence/timing` block for content fade-in + footer slide-up:

- `foundational-questions.tsx` (lines 114–153)
- `bombshell.tsx`
- `closing-reflection.tsx`
- `role-question.tsx`
- `driver-step-shell.tsx` (lines 50–89)
- Driver onboarding step screens (experience, employment, goals, etc.)

**Estimated duplication:** ~240 lines across 8 files

### B. Top bar (back + dots + spacer) (~15 lines each, 10 files)

Identical `<View style={styles.topBar}>` with back button + PageDots + spacer:

- `foundational-questions.tsx`, `bombshell.tsx`, `closing-reflection.tsx`, `role-question.tsx`
- All `driver-step-shell.tsx` consumers

**Estimated duplication:** ~150 lines across 10 files

### C. Auth layout guard (~15 lines each, 4 files)

Identical `useAuth()` → `isSignedIn` → `<Redirect>` pattern:

- `(driver)/_layout.tsx`, `(owner)/_layout.tsx`, `(client)/_layout.tsx`, `(corporate)/_layout.tsx`

**Estimated duplication:** ~60 lines across 4 files (could be a single shared guard)

### D. Back button with `canGoBack` fallback (~3 lines each, 10 files)

`router.canGoBack() ? router.back() : router.replace(...)` repeated in every screen.

**Estimated duplication:** ~30 lines across 10 files

**Total estimated duplicated code: ~480 lines**

---

## 14. Refactoring Opportunities

| #   | Opportunity                                    | Impact                                                | Risk                                           |
| --- | ---------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| 1   | **Extract `useEntranceAnimation()` hook**      | Eliminates ~240 lines of duplicate animation code     | Low — pure extraction                          |
| 2   | **Extract `AuthLayoutGuard` component**        | Eliminates 4 identical layout guards                  | Low — drop-in replacement                      |
| 3   | **Wire `useConvexUser` into root layout**      | Connects Clerk→Convex sync, enables cloud persistence | Medium — requires Convex URL                   |
| 4   | **Merge overlapping store fields**             | Single source of truth for onboarding answers         | Medium — affects 10+ screens                   |
| 5   | **Move MetaMap credentials to Convex actions** | Eliminates client-side secret exposure                | Medium — requires Convex action implementation |
| 6   | **Convert static styles to NativeWind**        | Aligns with AGENTS.md styling rule                    | Low — mechanical replacement                   |
| 7   | **Delete 3 unused components**                 | Cleaner codebase                                      | None                                           |
| 8   | **Split `closing-reflection.tsx`** (921 lines) | Better readability                                    | Low — extract sub-components                   |
