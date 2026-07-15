Read AGENTS.md fully — Convex is the primary backend.

Set up Convex incrementally without disrupting existing functionality.

## Steps

1. **Install Convex** — `bun add convex`
2. **Create `convex/` directory** with `tsconfig.json` (add `noEmit: true` to prevent .js output)
3. **Design the schema** (`convex/schema.ts`) — tables for: users, drivers, owners, vehicles, jobs, jobApplications, bookings, ratings, notifications, verifications. Add indexes for every primary lookup field.
4. **Create auth helper** (`convex/auth.ts`) — `getCurrentUser(ctx)` and `getCurrentUserOrThrow(ctx)` that read Clerk JWT from `ctx.auth` and look up the user by `clerkId`
5. **Create user functions** (`convex/users.ts`) — queries: `getCurrent`, `getByRole`. Mutations: `createOrUpdateFromClerk`, `updateRole`, `updateOnboardingComplete`, `updateProfile`
6. **Create driver functions** (`convex/drivers.ts`) — queries: `getByUserId`, `getVerified`. Mutations: `createProfile`, `updateProfile`, `updateVerificationStatus`
7. **Create owner, vehicle, job functions** — stubs with basic CRUD
8. **Create placeholder stubs** — bookings, ratings, notifications, metamap
9. **Add ConvexProvider** to root `_layout.tsx` — wrap `ClerkProvider` with `ConvexProvider`
10. **Create `useConvexUser` hook** (`src/hooks/useConvexUser.ts`) — syncs Clerk user to Convex on auth, returns reactive user record
11. **Add auth guards** to `(driver)`, `(owner)`, `(client)`, `(corporate)` layout files — check `isSignedIn`, redirect to sign-in if not
12. **Add `convex/_generated/`** to `.gitignore`
13. **Run `npx convex dev`** to deploy schema and generate types

## Rules

- Do not modify any existing UI, navigation, or onboarding screens
- Validate all inputs inside Convex mutations (never trust client)
- Use `v.union(v.literal(...))` for status fields, not raw strings
- Every table needs `createdAt` and `updatedAt` timestamps
- Every table needs at least one named index
- Run `bun run typecheck` and `bun run lint` — fix all errors before finishing
