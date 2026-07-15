Read AGENTS.md fully and strictly follow it before starting.

Perform a complete project inspection. Do not modify any code.

Produce a report covering:

1. **Architecture** — current stack, patterns used, AGENTS.md compliance
2. **Folder structure** — every directory and file, with line counts for key files
3. **Navigation** — Expo Router setup, route groups, guards, deep links
4. **Components** — all reusable components, which are used, which are unused
5. **Stores** — all Zustand stores with fields and actions
6. **Business logic** — where it lives, whether it follows the Screen → Component → Hook → Store → Convex pattern
7. **Clerk integration** — how auth is wired, what screens exist
8. **Convex integration** — schema tables, queries, mutations, actions (or note if absent)
9. **MetaMap integration** — how verification works, credential exposure issues
10. **Design system** — tokens from global.css, icon strategy, color usage
11. **Styling strategy** — NativeWind vs StyleSheet usage ratio, AGENTS.md exception compliance
12. **Technical debt** — every issue found, with severity and AGENTS.md conflict notes
13. **Duplicate code** — identical patterns across files, estimated line counts
14. **Refactoring opportunities** — safe improvements that preserve UI

Save the report to `phase-0/00-project-inspection.md`.
