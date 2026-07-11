Build (driver)/complete-profile.tsx, reachable via the "Complete your profile" banner on the Driver dashboard (not part of the onboarding funnel itself).

Capture the remaining structured fields not asked during Act 1:
- Full name (already have first name; capture surname etc.), gender, date of birth, nationality, languages
- License number, license class, expiry date, issuing authority
- Certifications, previous employers
- Document upload: driver's license, national ID, passport photo, police clearance, references

Allow partial completion and saving — do not require all fields in one session. Show a completion percentage that updates the dashboard's profile strength indicator.

Store in store/useDriverProfileStore.ts, persisted via AsyncStorage for now — no backend yet.