Read the "Onboarding & Role Routing Rules" section of AGENTS.md (Act 3, step 20) before starting.

Build (onboarding)/subscription.tsx:
- Driver: Free tier by default; optional "Premium Listing" paid tier — state pricing plainly, compare cost to something relatable (e.g. "less than a coffee a day")
- Vehicle Owner: Free tier by default; optional paid tier for premium job visibility
- Client: Free — skip straight through, no paywall shown
- Corporate: Present annual contract/subscription tiers clearly, with a "Continue, decide later" option

ALWAYS provide a clear, equally-visible way to continue without paying — never hide the existence of a paid tier, never use pressure tactics.

If a free trial is offered on a paid tier, schedule a local/push reminder notification for one day before the trial ends, clearly disclosed to the user at this screen (e.g. "We'll remind you before your trial ends").

Do not integrate real payment processing yet — this screen only records the chosen plan (or "free") in Zustand/AsyncStorage. Real billing comes in a later prompt.

Route to (onboarding)/commitment-complete → then to the role dashboard:
- Driver → (driver)/dashboard
- Vehicle Owner → (owner)/dashboard
- Client → (client)/dashboard
- Corporate → (corporate)/dashboard

Also set a persistent "Complete your profile" banner state in each dashboard, since full structured profile detail (license numbers, documents, etc.) has NOT been collected yet — only the lightweight Act 1 questions have been asked so far.