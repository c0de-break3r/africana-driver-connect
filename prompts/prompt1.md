Read AGENTS.md fully and strictly follow it before starting.
 
Initialize a new Expo project for Africana Driver Connect using:
- Expo Router
- TypeScript (strict mode)
- NativeWind / Tailwind CSS
- Zustand
- AsyncStorage
 
Set up the folder structure exactly as defined in AGENTS.md:
app/, components/, constants/, data/, hooks/, lib/, store/, types/, assets/
 
Create route groups: (auth)/, (onboarding)/, (driver)/, (owner)/, (client)/, (corporate)/
 
Set up global.css with Tailwind base styles and an empty utilities layer ready for BEM-style custom classes.
 
Create constants/images.ts as an empty centralized image export object, ready for future assets.
 
Do not build any screens yet. Confirm the project boots cleanly with a blank Home route before finishing.