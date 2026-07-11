Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 2, step 12) before starting.

Build (onboarding)/trial.tsx — a hands-on walkthrough of the core workflow, using the user's own answers. The user must DO the action, not just view a static screenshot of it. Use mocked/placeholder data behind the interaction for now.

By role:
- Driver: set availability status (interactive toggle), then see 2-3 mocked matched job cards appear based on stated vehicle types/experience
- Vehicle Owner: post a one-tap mock job listing, then see a mocked shortlist of verified drivers appear
- Client: perform a real search interaction (location + occasion type pre-filled), then see mocked live driver/vehicle match results appear
- Corporate: tap through a mocked "build your outsourcing plan" flow using their stated org size/needs

Add subtle interaction animations (card entrance, button press feedback, haptic feedback on the key action) per Motion & Interaction Rules.

Route to (onboarding)/congratulations next.