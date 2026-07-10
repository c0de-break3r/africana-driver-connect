Read AGENTS.md fully and strictly follow it before starting.

This is the most important screen in the app — read the "Onboarding & Role Routing Rules" section of AGENTS.md before starting.

Build (onboarding)/welcome.tsx:

- Welcome/splash screen (match html-reference/Splash & Onboarding Forms.html if a splash design exists)
- Brief app introduction with a "Get Started" button that routes to role-select

Build (onboarding)/role-select.tsx:

- Four visual role cards: Driver, Vehicle Owner, Client, Corporate Client
- Each card has an icon/illustration (from image-reference/), a title, and a one-line description:
  - Driver: "I drive — find job opportunities"
  - Vehicle Owner: "I own a vehicle — find drivers to hire"
  - Client: "I need a ride or driver for an occasion"
  - Corporate: "I manage outsourced drivers or fleets for my organization"
- This must feel like a genuine fork, not a settings toggle — match spacing/hierarchy from html-reference/ if a role-select design exists

On selection, store the role in a Zustand store (store/useRoleStore.ts) persisted to AsyncStorage, then route to (auth)/sign-up.

Do not build the onboarding branch screens yet — those come in prompts 5–8.
