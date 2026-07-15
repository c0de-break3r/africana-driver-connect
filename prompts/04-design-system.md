Read AGENTS.md fully. Read `src/global.css` and inspect the `html-reference/` folder.

Audit the design system and recommend improvements. Do not modify any code.

Cover:

1. **Color tokens** — are all colors from the reference defined? Are there hardcoded colors in screens that should be tokens?
2. **Typography** — font families, sizes, weights, line heights. Is `Outfit` loaded and used everywhere?
3. **Spacing scale** — is there a consistent spacing scale (4/8/12/16/24/32px)?
4. **Border radius** — sm/md/lg/xl values and usage consistency
5. **Shadows** — is `--shadow-theme` used consistently? Any hardcoded shadows?
6. **Icon strategy** — Ionicons vs emojis vs SVG. Are icons consistent?
7. **Custom utilities** — are there reusable BEM utilities in `global.css`? Should more be added?
8. **NativeWind theme** — does the `@theme` block match all design tokens?
9. **Missing tokens** — any colors, sizes, or effects used in screens but not in the theme?

Save the report to `phase-0/04-design-system.md`.
