# Implementation Roadmap — Africana Driver Connect

> Based on `phase-0/00-project-inspection.md` · No code modified.

---

## 1. Current Progress

| Feature                                                                  | Status         | Notes                                                                                    |
| ------------------------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------- |
| Expo project scaffolding (SDK 57)                                        | ✅ Done        | Managed workflow + dev client                                                            |
| Design system tokens (`global.css`)                                      | ✅ Done        | 11 color tokens, Outfit font, 4 radii, shadow                                            |
| Centralized image imports                                                | ✅ Done        | `constants/images.ts` — 6 welcome images + app icon + Google G                           |
| Clerk auth screens (sign-in, sign-up, forgot-password)                   | ✅ Done        | Email/password + Google SSO                                                              |
| SSO callback handler                                                     | ✅ Done        | `(auth)/sso-callback.tsx`                                                                |
| Auth layout guard (redirect signed-in)                                   | ✅ Done        | `(auth)/_layout.tsx`                                                                     |
| Auth guards on all role groups                                           | ✅ Done        | 4 identical `<Redirect>` guards                                                          |
| Welcome carousel (5 slides, crossfade, swipe)                            | ✅ Done        | Auto-advance + manual swipe + dot-tap                                                    |
| Role question screen                                                     | ✅ Done        |                                                                                          |
| Role selection screen (4 roles)                                          | ✅ Done        | The core UX fork                                                                         |
| Foundational questions (role-branched Q&A)                               | ✅ Done        | Driver/Owner/Client/Corporate variants                                                   |
| Bombshell screen                                                         | ✅ Done        |                                                                                          |
| Closing reflection screen                                                | ✅ Done        | 921 lines — largest file                                                                 |
| Driver onboarding (10-step flow)                                         | ✅ Done        | experience → employment → goals → license → verify → vehicle → job-type → location → otp |
| Driver step shell (reusable component)                                   | ✅ Done        | Shared top bar + animation + CTA                                                         |
| Driver dashboard (5 bottom tabs)                                         | ✅ Done        | Home, Jobs, Messages, Notifications, Profile                                             |
| Driver modal screens (settings, help, wallet, ratings, complete-profile) | ✅ Done        | Placeholder UI                                                                           |
| `useRoleStore` (Zustand, persisted)                                      | ✅ Done        | role + onboardingComplete                                                                |
| `useDriverOnboardingStore` (Zustand, persisted)                          | ✅ Done        | 16 fields, 12 actions                                                                    |
| `useOnboardingAnswersStore` (Zustand, persisted)                         | ✅ Done        | Role-branched answers + progress                                                         |
| Role-based post-auth routing                                             | ✅ Done        | `lib/routing.ts`                                                                         |
| `router.back()` guards                                                   | ✅ Done        | All calls use `canGoBack()` + fallback                                                   |
| Safe native module imports (expo-camera)                                 | ✅ Done        | `try/catch` around `require()`                                                           |
| Convex schema (10 tables, indexes)                                       | ✅ Done        | `convex/schema.ts`                                                                       |
| Convex functions (users, drivers, owners, vehicles, jobs)                | ✅ Done        | Queries + mutations                                                                      |
| Convex auth helpers                                                      | ✅ Done        | `getCurrentUser`, `getCurrentUserOrThrow`                                                |
| Convex placeholder files (bookings, ratings, notifications, metamap)     | ✅ Done        | Comments only                                                                            |
| MetaMap SDK integration (client-side)                                    | ✅ Done        | Native flow + theme + NativeEventEmitter patch                                           |
| MetaMap EAS config plugin                                                | ✅ Done        | `plugins/with-metamap-fixes.js`                                                          |
| Clerk Expo Go compatibility patch                                        | ✅ Done        | `scripts/patch-clerk-expo.js`                                                            |
| `useConvexUser` hook                                                     | ⚠️ Partial     | Written but **never called** — sync doesn't run                                          |
| Clerk → Convex auth bridging                                             | ⚠️ Partial     | Hook exists but no token provider configured                                             |
| Driver dashboard data                                                    | ⚠️ Partial     | UI shells only, no Convex queries wired                                                  |
| MetaMap REST API (server-side)                                           | ⚠️ Partial     | Documented in comments, not implemented                                                  |
| Owner route group                                                        | 🔲 Shell       | Auth guard layout only — 0 screens                                                       |
| Client route group                                                       | 🔲 Shell       | Auth guard layout only — 0 screens                                                       |
| Corporate route group                                                    | 🔲 Shell       | Auth guard layout only — 0 screens                                                       |
| Owner onboarding flow                                                    | ❌ Not Started |                                                                                          |
| Client onboarding flow                                                   | ❌ Not Started |                                                                                          |
| Corporate onboarding flow                                                | ❌ Not Started |                                                                                          |
| Job marketplace (search, filter, apply)                                  | ❌ Not Started | Convex `jobs.ts` exists but UI not connected                                             |
| Booking system                                                           | ❌ Not Started | Convex placeholder only                                                                  |
| Driver search & discovery                                                | ❌ Not Started |                                                                                          |
| Smart matching engine                                                    | ❌ Not Started |                                                                                          |
| Wallet & transactions                                                    | ❌ Not Started |                                                                                          |
| Payment processing (mobile money + card)                                 | ❌ Not Started |                                                                                          |
| Escrow system                                                            | ❌ Not Started |                                                                                          |
| Subscription plans & feature gates                                       | ❌ Not Started |                                                                                          |
| Commission engine                                                        | ❌ Not Started |                                                                                          |
| Real-time messaging (chat)                                               | ❌ Not Started |                                                                                          |
| Push + in-app notifications                                              | ❌ Not Started |                                                                                          |
| File storage (document uploads via Convex)                               | ❌ Not Started |                                                                                          |
| AI features (pricing, descriptions, summaries)                           | ❌ Not Started |                                                                                          |
| Admin panel                                                              | ❌ Not Started |                                                                                          |
| GPS live tracking                                                        | ❌ Not Started |                                                                                          |
| Ratings & reviews (functional)                                           | ❌ Not Started | Convex placeholder only                                                                  |
| Testing infrastructure                                                   | ❌ Not Started |                                                                                          |
| Performance optimization                                                 | ❌ Not Started |                                                                                          |
| Security audit & hardening                                               | ❌ Not Started |                                                                                          |
| Deployment (EAS Build + app Store)                                       | ❌ Not Started |                                                                                          |
| Monitoring & maintenance                                                 | ❌ Not Started |                                                                                          |

**Summary:** 32 done, 4 partial, 3 shell, 21 not started = **60 total features**

---

## 2. Remaining Features

| #   | Feature                                        | Priority    | Dependencies       | Description                                                            |
| --- | ---------------------------------------------- | ----------- | ------------------ | ---------------------------------------------------------------------- |
| 1   | **Wire `useConvexUser` into root layout**      | 🔴 Critical | Convex URL in .env | Connect Clerk→Convex sync so every signed-in user gets a Convex record |
| 2   | **Configure Clerk→Convex JWT bridging**        | 🔴 Critical | #1                 | Pass Clerk JWT to Convex so `ctx.auth.getUserIdentity()` works         |
| 3   | **Add `EXPO_PUBLIC_CONVEX_URL` to `.env`**     | 🔴 Critical | Convex deployment  | App crashes on startup without it                                      |
| 4   | **Connect onboarding to Convex mutations**     | 🔴 Critical | #1, #2             | Call `users.updateRole`, `drivers.createProfile` from UI               |
| 5   | **Move MetaMap credentials server-side**       | 🔴 Critical | Convex actions     | Remove `EXPO_PUBLIC_METAMAP_CLIENT_ID` from client bundle              |
| 6   | **Merge overlapping Zustand stores**           | 🟡 High     | —                  | Consolidate `yearsExperience`/`employmentStatus` into single source    |
| 7   | **Owner onboarding flow**                      | 🟡 High     | #4                 | Vehicle details, company info, document upload                         |
| 8   | **Client onboarding flow**                     | 🟡 High     | #4                 | Occasion type, booking preferences, payment setup                      |
| 9   | **Corporate onboarding flow**                  | 🟡 High     | #4                 | Fleet size, outsourcing needs, company profile                         |
| 10  | **Owner dashboard**                            | 🟡 High     | #7                 | Vehicle list, post job, applications received, active hires            |
| 11  | **Client dashboard**                           | 🟡 High     | #8                 | Active bookings, past rides, favorite drivers                          |
| 12  | **Corporate dashboard**                        | 🟡 High     | #9                 | Fleet overview, driver management, billing                             |
| 13  | **Job marketplace (browse + search + filter)** | 🟡 High     | #4, #10            | Connect Convex `jobs.list` to browsable UI with filters                |
| 14  | **Job application flow**                       | 🟡 High     | #13                | Driver applies → owner reviews → accept/reject                         |
| 15  | **Booking system**                             | 🟡 High     | #4, #11            | Create, confirm, track, complete bookings                              |
| 16  | **Driver search & discovery**                  | 🟡 High     | #4                 | Browse verified drivers with profiles                                  |
| 17  | **File storage (Convex)**                      | 🟡 High     | Convex `_storage`  | Document uploads for license, vehicle, ID                              |
| 18  | **MetaMap REST API integration**               | 🟡 High     | #5                 | Convex action: OAuth → create verification → upload docs → webhook     |
| 19  | **Wallet system**                              | 🟠 Medium   | #4, #15            | Balance, transactions, top-up, withdrawal                              |
| 20  | **Payment processing**                         | 🟠 Medium   | #19                | Mobile money (MTN, Vodafone) + card (Stripe/Paystack)                  |
| 21  | **Escrow system**                              | 🟠 Medium   | #15, #20           | Hold payment until booking completed                                   |
| 22  | **Smart matching engine**                      | 🟠 Medium   | #16, #13           | Proximity, rating, cost, experience scoring                            |
| 23  | **Ratings & reviews**                          | 🟠 Medium   | #15                | Post-booking rating flow, display on profiles                          |
| 24  | **Push notifications**                         | 🟠 Medium   | Expo Notifications | Booking status, job alerts, messages                                   |
| 25  | **Real-time chat**                             | 🟠 Medium   | Convex real-time   | Driver ↔ client/owner messaging                                        |
| 26  | **GPS live tracking**                          | 🟠 Medium   | Maps SDK, #15      | Live driver location during active bookings                            |
| 27  | **Subscription plans**                         | 🟢 Low      | #19                | Premium tiers with feature gates                                       |
| 28  | **Commission engine**                          | 🟢 Low      | #20, #15           | Platform fee calculation per transaction                               |
| 29  | **AI features**                                | 🟢 Low      | Backend API        | Pricing suggestions, description generation, review summaries          |
| 30  | **Admin panel**                                | 🟢 Low      | All above          | Moderation, analytics, user management                                 |
| 31  | **NativeWind migration**                       | 🟢 Low      | —                  | Convert StyleSheet screens to NativeWind className                     |
| 32  | **Refactor duplicated code**                   | 🟢 Low      | —                  | Extract animation hook, auth guard component, back-button helper       |
| 33  | **Testing infrastructure**                     | 🟢 Low      | —                  | Unit, component, integration tests                                     |
| 34  | **Performance optimization**                   | 🟢 Low      | All above          | Bundle size, Convex query optimization, Reanimated migration           |
| 35  | **Security audit**                             | 🟢 Low      | All above          | Auth hardening, data protection, input validation                      |
| 36  | **Deployment**                                 | 🟢 Low      | All above          | EAS Build profiles, app store submission, CI/CD                        |

---

## 3. Implementation Order

### Phase 1 — Foundation Fixes (1–2 days)

> Fix the critical plumbing that blocks everything else.

1. Add `EXPO_PUBLIC_CONVEX_URL` to `.env` (run `npx convex dev` to generate)
2. Configure Clerk JWT provider for Convex (`ConvexProviderWithClerk` or custom token fetcher)
3. Wire `useConvexUser()` into the root `_layout.tsx`
4. Connect role selection → `users.updateRole` Convex mutation
5. Connect driver onboarding completion → `drivers.createProfile` Convex mutation
6. Move MetaMap credentials to Convex environment variables
7. Merge overlapping Zustand store fields
8. Delete 3 unused components (SecondaryButton, Card, FadeInText)

### Phase 2 — Complete Remaining Onboarding Flows (3–5 days)

> Build the three missing role-specific onboarding paths.

9. Owner onboarding: vehicle count, company name, verification intent
10. Client onboarding: occasion type, booking frequency, payment preference
11. Corporate onboarding: org size, outsourcing challenge, fleet needs
12. Update `lib/routing.ts` to route owner/client/corporate to their dashboards (instead of `trial.tsx`)
13. Persist onboarding answers to Convex (call `users.updateProfile` per role)

### Phase 3 — Role Dashboards (5–7 days)

> Build functional dashboards for the three empty role groups.

14. Owner dashboard: vehicle list, "Post a Job" CTA, applications inbox, active hires
15. Client dashboard: "Book a Driver" CTA, active bookings, past rides, favorite drivers
16. Corporate dashboard: fleet overview, driver roster, billing summary, analytics
17. Wire driver dashboard tabs to Convex queries (jobs list, notifications, profile)

### Phase 4 — Job Marketplace (5–7 days)

> The core two-sided marketplace: owners post jobs, drivers apply.

18. Job search screen with filters (category, location, pay range)
19. Job detail screen with full description and "Apply" button
20. Job posting form for owners (title, description, category, pay)
21. Application tracking screen (driver's applications + status)
22. Owner application review screen (accept/reject with notes)
23. Connect all to existing `convex/jobs.ts` functions

### Phase 5 — Booking System (7–10 days)

> The client-side booking flow that generates revenue.

24. Implement `convex/bookings.ts` (create, updateStatus, getByClient, getByDriver, getActive)
25. Client booking flow: select occasion → choose driver → schedule → confirm
26. Driver booking acceptance/rejection
27. Booking status tracking (pending → confirmed → in_progress → completed)
28. Booking history for both client and driver
29. Dispute resolution flow (flag booking → admin review)

### Phase 6 — Payments & Wallet (7–10 days)

> Money movement: the marketplace only works if people get paid.

30. Implement wallet schema and Convex functions
31. Mobile money integration (MTN MoMo, Vodafone Cash) via backend API
32. Card payment integration (Paystack or Stripe) via backend API
33. Escrow: hold client payment → release to driver on completion
34. Commission calculation (platform fee per transaction)
35. Transaction history screen (wallet tab)

### Phase 7 — Communication (5–7 days)

> Real-time features that make the marketplace feel alive.

36. Implement `convex/notifications.ts` (create, getByUser, markRead)
37. Push notification setup (expo-notifications, booking status alerts, job matches)
38. In-app notification center (bell icon badge + notification list)
39. Real-time chat using Convex subscriptions (driver ↔ client, driver ↔ owner)
40. File attachments in chat (images, documents)

### Phase 8 — Verification & Identity (3–5 days)

> Complete the identity verification pipeline end-to-end.

41. Implement `convex/metamap.ts` REST API action (OAuth → verification → upload → webhook)
42. Convex HTTP endpoint for MetaMap webhooks (verification results)
43. File upload via Convex `_storage` (license photos, Ghana Card, police clearance)
44. Document verification status display on driver profiles
45. Vehicle document upload and verification flow for owners

### Phase 9 — Discovery & Matching (5–7 days)

> Help users find each other efficiently.

46. Driver search screen with filters (location, vehicle type, rating, experience)
47. Driver profile cards with ratings, trip count, verification badges
48. Smart matching algorithm (score = proximity × 0.3 + rating × 0.3 + cost × 0.2 + experience × 0.2)
49. Location services (expo-location) with geofencing for nearby drivers
50. GPS live tracking during active bookings (react-native-maps)

### Phase 10 — Ratings & Reviews (2–3 days)

> Trust signals for the marketplace.

51. Implement `convex/ratings.ts` (create, getByUser, getRecent, averageScore)
52. Post-booking rating prompt (stars + comment)
53. Rating display on driver/owner profiles
54. Review moderation (flag inappropriate reviews)

### Phase 11 — Advanced Features (5–10 days)

> Premium features and monetization.

55. Subscription plans (free, premium, enterprise tiers)
56. Feature gates (premium drivers see jobs first, premium owners post unlimited jobs)
57. AI-powered pricing suggestions (based on route, time, demand)
58. AI-generated job descriptions and driver bios
59. AI review summaries ("Drivers say: punctual, professional...")

### Phase 12 — Admin & Operations (5–7 days)

> Back-office tools for platform management.

60. Admin route group with auth guard (super-admin role check)
61. User management (search, ban, role change)
62. Content moderation (reported reviews, flagged bookings)
63. Platform analytics (signups, bookings, revenue, retention)
64. Dispute resolution dashboard

### Phase 13 — Polish & Ship (5–7 days)

> Quality, performance, and deployment.

65. Convert StyleSheet screens to NativeWind (per AGENTS.md rule)
66. Extract shared hooks (useEntranceAnimation, useAuthGuard, useSafeBack)
67. Split `closing-reflection.tsx` (921 lines) into sub-components
68. Testing infrastructure (Jest + React Native Testing Library + E2E with Maestro)
69. Performance audit (bundle size, Convex query optimization, Reanimated migration)
70. Security audit (input validation, rate limiting, data encryption)
71. EAS Build profiles (development, preview, production)
72. App store submission (Google Play + Apple App Store)
73. Monitoring setup (Crashlytics, analytics, error reporting)

---

## 4. Dependency Graph

```
Phase 1 (Foundation)
  └─ EXPO_PUBLIC_CONVEX_URL ──→ Clerk→Convex JWT bridging
                                  └─→ useConvexUser wired
                                       └─→ Onboarding→Convex mutations
                                            └─→ MetaMap server-side
                                                 └─→ All data features

Phase 2 (Onboarding) ──depends──→ Phase 1
  └─ Owner/Client/Corporate flows
       └─→ routing.ts update
            └─→ Dashboard routing

Phase 3 (Dashboards) ──depends──→ Phase 2
  └─ Owner/Client/Corporate dashboards
       └─→ Convex query wiring

Phase 4 (Marketplace) ──depends──→ Phase 3
  └─ Jobs + Applications
       └─→ Booking system (Phase 5)

Phase 5 (Bookings) ──depends──→ Phase 4
  └─→ Payments (Phase 6)
  └─→ Ratings (Phase 10)
  └─→ Chat (Phase 7)

Phase 6 (Payments) ──depends──→ Phase 5
  └─→ Wallet → Escrow → Commission

Phase 7 (Communication) ──depends──→ Phase 5
  └─→ Notifications → Chat

Phase 8 (Verification) ──depends──→ Phase 1
  └─→ MetaMap REST → File storage → Document verification

Phase 9 (Discovery) ──depends──→ Phase 4, Phase 8
  └─→ Driver search → Matching → GPS tracking

Phase 10 (Ratings) ──depends──→ Phase 5

Phase 11 (Advanced) ──depends──→ Phase 6, Phase 9

Phase 12 (Admin) ──depends──→ All above

Phase 13 (Polish) ──depends──→ All above
```

**Critical path:** Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

---

## 5. Risks

| #   | Risk                                                                    | Severity    | Likelihood | Mitigation                                                                      |
| --- | ----------------------------------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------------------------- |
| 1   | **Clerk→Convex JWT bridging fails or is unsupported**                   | 🔴 Critical | Medium     | Test early in Phase 1; fall back to custom token verification if needed         |
| 2   | **MetaMap REST API migration breaks existing SDK flow**                 | 🟡 High     | Medium     | Keep SDK flow working while building REST action in parallel                    |
| 3   | **Mobile money provider API downtime or sandbox limitations**           | 🟡 High     | High       | Use provider sandbox for dev; implement retry + offline queue for production    |
| 4   | **Expo dev client rebuild required for every native module change**     | 🟡 High     | Certain    | Document rebuild requirements; batch native module additions                    |
| 5   | **Convex real-time subscription performance at scale**                  | 🟠 Medium   | Low        | Use pagination, limit subscriptions per client, monitor OCC conflicts           |
| 6   | **Store state corruption on app update** (AsyncStorage schema mismatch) | 🟠 Medium   | Medium     | Version Zustand stores; implement migration functions                           |
| 7   | **NativeWind v5 preview instability**                                   | 🟠 Medium   | Medium     | Pin exact version; test every UI change on device                               |
| 8   | **EAS build queue times for free tier**                                 | 🟠 Medium   | High       | Use `--local` builds when possible; upgrade EAS plan if needed                  |
| 9   | **Clerk free tier rate limits hit during development**                  | 🟠 Medium   | High       | Monitor Clerk dashboard; implement auth caching; reduce redundant sign-in calls |
| 10  | **Android-only native module crashes on iOS**                           | 🟠 Medium   | Medium     | Test on both platforms; use conditional imports per platform                    |
| 11  | **Driver verification false negatives from MetaMap**                    | 🟠 Medium   | Medium     | Implement manual review fallback; clear rejection messaging with retry          |
| 12  | **Payment disputes without escrow**                                     | 🟡 High     | High       | Build escrow before launching payments; clear T&C screens                       |
| 13  | **App store rejection (camera/permissions)**                            | 🟠 Medium   | Medium     | Pre-fill permission descriptions in `app.json`; test against store guidelines   |
| 14  | **Overlapping Zustand stores cause stale data**                         | 🟠 Medium   | High       | Merge stores in Phase 1; add store reset on logout                              |
| 15  | **Convex `_storage` file size limits**                                  | 🟢 Low      | Low        | Compress images before upload; set max file size in mutations                   |

---

## 6. Future Scalability

### Data Persistence

- **Current:** Zustand + AsyncStorage (local only, lost on uninstall)
- **Phase 1:** Convex cloud persistence for all user data
- **Future:** Convex database backups, point-in-time recovery, data export

### Real-Time

- **Current:** None wired (Convex supports it but not used)
- **Phase 5+:** Convex subscriptions for booking status, chat messages, driver location
- **Future:** WebSocket channels for live tracking, collaborative features

### File Uploads

- **Current:** None (MetaMap handles verification images internally)
- **Phase 8:** Convex `_storage` for license photos, vehicle documents, profile pictures
- **Future:** CDN-backed image delivery, image optimization, video uploads

### Payment Providers

- **Phase 6 candidates:**
  - **Paystack** — card + mobile money, strong in Ghana/Nigeria, simple API
  - **Flutterwave** — wider African coverage, more complex API
  - **Hubtel** — Ghana-specific mobile money, good local support
- **Architecture:** Backend Convex actions call payment provider APIs; frontend only shows status
- **Future:** Multi-currency support, cross-border payments, crypto

### Multi-Language

- **Current:** English only (`fixedLanguage: "en"` in MetaMap theme)
- **Future:** i18n with `expo-localization`, support for Twi, Ga, Hausa, French
- **Approach:** Externalize all UI strings to a translation file; use ICU message format

### Admin & Operations

- **Phase 12:** Web-based admin panel (could be a separate Next.js app sharing Convex backend)
- **Future:** Role-based admin access, audit logs, automated fraud detection, SLA monitoring

### Infrastructure

- **Current:** Single Convex deployment, single Clerk instance
- **Future:** Multi-region Convex deployment, CDN for static assets, edge functions for matching
- **Monitoring:** Sentry for crash reporting, Convex dashboard for query performance, Clerk analytics for auth metrics

### Offline Support

- **Current:** None (app requires network for auth and data)
- **Future:** Convex offline queries, optimistic UI updates, offline booking creation with sync queue
