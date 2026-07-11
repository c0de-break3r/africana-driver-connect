Reference html-reference/* and image-reference/* at project root.

Extract the color palette, font sizes, spacing scale, and border-radius values used across the reference screens.

Add these as Tailwind theme extensions in tailwind.config.js (colors, fontSize, borderRadius, spacing).

Create a components/ui/ folder with base primitives that match the reference exactly:
- PrimaryButton
- SecondaryButton
- Card
- ScreenContainer (handles SafeAreaView with StyleSheet, per AGENTS.md style exception rules)
- ProgressBar (for onboarding progress across the 3-act flow)
- FadeInText (reusable line-by-line fade-in component, used across multiple reflection screens)

Ask permission before adding expo-haptics for haptic feedback per AGENTS.md Motion & Interaction rules, and explain why. Do not build feature screens yet. Show me the token values you extracted before implementing.