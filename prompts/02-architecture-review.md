Read AGENTS.md fully. Read `phase-0/00-project-inspection.md` for current state.

Review the architecture against software design principles. Do not modify any code.

Evaluate:

1. **SOLID** — does each screen/hook/store have a single responsibility? Are dependencies inverted?
2. **DRY** — quantify duplicate code. Where are the worst violations?
3. **KISS** — is the current approach simple? Any overengineered abstractions?
4. **YAGNI** — any unused code, dead components, or speculative features?
5. **Separation of concerns** — does business logic live in screens (bad) or hooks/stores/Convex (good)?
6. **Folder organization** — does it match AGENTS.md? Are there empty directories?
7. **Navigation** — route groups, guards, deep link handling
8. **State management** — Zustand stores, persistence, overlap between stores
9. **Scalability** — can this architecture support 4 role dashboards, real-time bookings, payments?

Save the report to `phase-0/02-architecture-review.md`.
