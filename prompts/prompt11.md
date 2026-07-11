Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 1, step 9) before starting.

Build (onboarding)/question-bank.tsx as a deeper series of role-specific questions (roughly 4-6 per role), each followed by a brief reflection screen mirroring the answer back before the next question (e.g. "Got it, [Name] — you're looking for a driver for weddings and events.").

Be deliberate with both questions and answer options — answers should reflect specific struggles the target user actually has, phrased so the user thinks "that's literally me," not generic categories.

Driver examples: "What's held you back from getting hired so far?" (no verified profile, no referrals, inconsistent job postings, distrustful owners); "What matters most in a job?" (pay, stability, flexible hours, respect)
Vehicle Owner examples: "What's gone wrong with drivers before?" (no-shows, poor driving, dishonesty, no license); "What do you need most?" (speed, trust, affordability, availability)
Client examples: "What's stressed you out about booking transport before?" (unreliable drivers, unclear pricing, safety concerns, no tracking)
Corporate examples: "What's the biggest risk in your current setup?" (compliance, cost overruns, driver turnover, no accountability)

End with a final reflection screen where each of the user's answers fades in one line at a time, using the FadeInText component from Prompt 02.

Store all answers in store/useOnboardingAnswersStore.ts.

Route to (onboarding)/closing-reflection next.