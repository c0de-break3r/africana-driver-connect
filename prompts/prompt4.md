Read AGENTS.md fully and strictly follow it before starting.

Set up Clerk authentication per AGENTS.md — do not build custom auth.

Build the (auth)/ route group:

- Phone/email sign-up
- OTP verification
- Social login buttons (if present in reference)

Auth is role-aware at this stage — the selected role from onboarding (prompt 3) is already stored in Zustand and will be associated with the user profile after successful auth.

Store the authenticated user session using Clerk's hooks. Do not persist tokens manually.

After successful auth, route the user into their role-specific onboarding branch or dashboard based on the role selected during onboarding:

- Driver → (onboarding)/driver-setup
- Owner → (onboarding)/owner-setup
- Client → (onboarding)/client-setup
- Corporate → (onboarding)/corporate-setup
