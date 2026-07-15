Read AGENTS.md fully — Clerk handles authentication, Convex handles user data.

Integrate Clerk authentication with the existing app and refactor auth logic out of screens.

## Current State

Auth screens exist: `sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx`, `sso-callback.tsx`. All contain business logic (Clerk calls, form validation, navigation) directly in screens. This violates AGENTS.md.

## Tasks

1. **Extract auth hooks** into `src/hooks/`:
   - `useSignInFlow.ts` — email/password sign-in + Google OAuth via `useSignIn` and `useSSO`
   - `useSignUpFlow.ts` — account creation + OTP email verification via `useSignUp`
   - `usePasswordReset.ts` — 4-phase reset flow via `useSignIn().signIn.resetPasswordEmailCode`
2. **Extract shared auth UI** into `src/components/ui/`:
   - `auth-input.tsx` — labeled input with error state
   - `auth-social-buttons.tsx` — Google OAuth button
   - `auth-footer.tsx` — "Don't have an account? Sign up" / "Already have an account? Sign in" links
   - `auth-back-button.tsx` — consistent back navigation
3. **Extract `useStaggeredEntrance` hook** — the 4-layer `Animated.parallel` entrance animation used in all auth screens + role-question
4. **Refactor auth screens** — screens become thin: compose components + call hooks. No business logic.
5. **Wire `useConvexUser`** into the auth layout so signed-in users auto-sync to Convex
6. **Ensure auth guard** in `(auth)/_layout.tsx` redirects signed-in users to their role dashboard

## Rules

- Existing UI must look identical after refactoring
- All Clerk calls go through hooks, never directly in screens
- Run `bun run typecheck` and `bun run lint` — fix all errors
