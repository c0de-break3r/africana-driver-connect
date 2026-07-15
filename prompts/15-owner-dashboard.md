Read AGENTS.md fully. The owner dashboard is empty — build it from scratch.

Build the complete vehicle owner dashboard with tab navigation.

## Current State

`(owner)/_layout.tsx` is an empty Stack with an auth guard. No screens exist.

## Tasks

1. **Create tab layout** `(owner)/(tabs)/_layout.tsx`:
   - Tabs: Home, Vehicles, Jobs, Applications, Profile
   - Ionicons for tab icons
   - Match driver tab layout visual style
2. **Home tab** `(owner)/(tabs)/index.tsx`:
   - Summary stats: total vehicles, active jobs, applications received, total spent
   - Quick actions: Post a Job, Register Vehicle, View Applications
   - Recent activity feed (last 5 actions)
3. **Vehicles tab** `(owner)/(tabs)/vehicles.tsx`:
   - List of registered vehicles from Convex `vehicles.getByOwner`
   - Vehicle card: make, model, year, type, plate, registration status badge
   - FAB to add new vehicle → vehicle registration screen
   - Friendly empty state if no vehicles
4. **Jobs tab** `(owner)/(tabs)/jobs.tsx`:
   - List of posted jobs from Convex `jobs` table (filtered by ownerId)
   - Job card: title, category, location, pay range, status badge, application count
   - FAB to post new job → job creation screen
   - Status filter: open, filled, closed
5. **Applications tab** `(owner)/(tabs)/applications.tsx`:
   - Applications for all owner's jobs
   - Grouped by job
   - Application card: driver name, experience, rating, applied date
   - Accept/reject actions
6. **Profile tab** `(owner)/(tabs)/profile.tsx`:
   - User info from Convex
   - Company name, vehicle count
   - Settings, help, logout
7. **Create support screens**:
   - `(owner)/post-job.tsx` — job creation form
   - `(owner)/register-vehicle.tsx` — vehicle registration form
   - `(owner)/job-detail.tsx` — job detail with applications list
8. **Create `convex/dashboard.ts`** — owner-specific stats queries

## Design

- Peach background, navy headings, orange accents
- Card-based layout with soft shadows
- Status badges: green (verified/accepted), yellow (pending), red (rejected)
- Match driver dashboard visual quality

## Rules

- All data from Convex queries — no hardcoded placeholders
- Use `ScreenContainer` for all screens
- Run `bun run typecheck` and `bun run lint` — fix all errors
