Read AGENTS.md fully and strictly follow it before starting.

Build (onboarding)/driver-setup.tsx as a short multi-step flow:

Step 1: Full name, gender, date of birth, nationality, languages
Step 2: License number, license class, expiry date, issuing authority
Step 3: Years of experience, vehicle types driven, certifications

Do NOT require document upload (license photo, national ID, police clearance) to complete onboarding — capture a placeholder "Upload later" state per driver, and route them into the (driver)/ dashboard with a persistent "Complete verification" banner instead of blocking signup.

Store this data in Zustand (store/useDriverProfileStore.ts), persisted via AsyncStorage for now — no backend yet.

End this flow at a "Verification in progress" trust screen before routing to (driver)/dashboard.
