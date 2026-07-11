Read AGENTS.md fully and strictly follow it before starting.

Go through every screen built so far and:

- Verify pixel-fidelity against html-reference/ and image-reference/ per AGENTS.md UI Implementation Rules
- Verify the reflect-back principle is visibly present at every point across all three acts, not just implemented in state
- Verify haptic feedback, fade-in animations, and custom illustrations are actually applied per Motion & Interaction Rules — not just scaffolded
- Add friendly empty states (no jobs yet, no bookings yet, etc.)
- Add loading skeletons where data is fetched
- Verify large touch targets and consistent spacing across all four role dashboards
- Run `bun run lint` and `bun run typecheck`, fix all errors

Report a summary of what was fixed, screen by screen.
