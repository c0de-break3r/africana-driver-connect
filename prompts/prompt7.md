Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 1, step 5) before starting.

Build (onboarding)/role-question.tsx:
- Headline using the user's name from the previous screen: "What's slowing you down right now, [Name]?"
- Four answer cards, phrased as struggles/needs rather than plain role labels:
  - "I can't find reliable work as a driver" → Driver
  - "I can't find drivers I can trust" → Vehicle Owner
  - "I need a driver for an occasion or trip" → Client
  - "I need to outsource drivers or fleet for my organization" → Corporate Client
- Add haptic feedback on card selection per Motion & Interaction Rules

Store the role in store/useRoleStore.ts (persisted via AsyncStorage).

Route to (onboarding)/foundational-questions next.