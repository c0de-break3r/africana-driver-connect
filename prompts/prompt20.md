Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 3, step 18) before starting.

Build (onboarding)/permissions.tsx:
- Notification permission request, framed with context first (e.g. "We'll let you know the moment you get a match") before the OS prompt fires
- Location permission request, framed with context first (needed for GPS matching)
- Use fade-in animations for each framing screen per Motion & Interaction Rules — do not dump a bare OS prompt with no lead-in

Route to (onboarding)/social-proof next.