Read AGENTS.md fully and strictly follow it before starting.

Reference html-reference/Splash & Onboarding Forms.html at project root.

Extract the color palette, font sizes, spacing scale, and border-radius values used across the reference screens.

Add these as Tailwind theme extensions in tailwind.config.js (colors, fontSize, borderRadius, spacing).

Create a components/ui/ folder with base primitives that match the reference exactly:

- PrimaryButton
- SecondaryButton
- Card
- ScreenContainer (handles SafeAreaView with StyleSheet, per AGENTS.md style exception rules)

Do not build feature screens yet. Show me the token values you extracted before implementing.
