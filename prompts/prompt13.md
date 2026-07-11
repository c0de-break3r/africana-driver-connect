Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 2, step 11) before starting.

Set up Clerk authentication per AGENTS.md — do not build custom auth.

Build the (auth)/ route group:
- Sign-up screen: phone/email + OTP verification
- Framing copy referencing the name and what's been built so far, e.g. "Save your answers, [Name] — create your account to continue"
- Social login buttons (if present in reference)

The underlying Clerk flow is identical regardless of role — only the framing copy changes based on store/useRoleStore.ts.

Store the authenticated session using Clerk's hooks. Do not persist tokens manually.

Route to (onboarding)/trial next.