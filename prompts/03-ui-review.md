Read AGENTS.md fully. Read every screen file in `src/app/` and every component in `src/components/`.

Perform a UI quality audit. Do not modify any code.

For each screen, evaluate:

1. **Design system compliance** — does it use tokens from `global.css` (colors, radii, fonts, shadows)?
2. **Spacing consistency** — padding, margins, gap values
3. **Typography hierarchy** — heading sizes, body text, muted text
4. **Component usage** — does it use `ScreenContainer`, `PrimaryButton`, `Card` where appropriate?
5. **NativeWind vs StyleSheet** — does it follow AGENTS.md styling rules and exceptions?
6. **Animation quality** — entrance animations, transitions, haptics
7. **Empty states** — friendly placeholders where data is missing
8. **Error states** — visible error messages, loading indicators
9. **Touch targets** — minimum 44px for interactive elements
10. **Responsiveness** — does it handle different screen sizes?

Identify screens that need UI polish. Rank by severity (Critical → Low).

Save the report to `phase-0/03-ui-review.md`.
