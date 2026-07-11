Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 1, step 6) before starting.

Build (onboarding)/foundational-questions.tsx, branching by role, 2 short questions each — these exist specifically to set up the next screen's personalized stat, not to fill time:

Driver: years of driving experience; current employment status (employed / looking / open to offers)
Vehicle Owner: number of vehicles owned; biggest driver-hiring pain point (trust, availability, cost, no-shows)
Client: occasion type (Wedding, Airport, Event, Daily Commute, Business Trip, Other) — store as `preferredOccasionType`; booking frequency (occasional / regular)
Corporate: organization size; biggest outsourcing challenge (cost, reliability, compliance, scale)

Store answers in store/useOnboardingAnswersStore.ts.

Route to (onboarding)/bombshell next.