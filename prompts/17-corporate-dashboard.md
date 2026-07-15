Read AGENTS.md fully. The corporate dashboard is empty — build it from scratch.

Build the complete corporate fleet management dashboard.

## Current State

`(corporate)/_layout.tsx` is an empty Stack with an auth guard. No screens exist.

## Tasks

1. **Create tab layout** `(corporate)/(tabs)/_layout.tsx`:
   - Tabs: Home, Fleet, Drivers, Contracts, Profile
   - Ionicons for tab icons
2. **Home tab** `(corporate)/(tabs)/index.tsx`:
   - Dashboard overview: active contracts, fleet size, driver count, monthly spend
   - Key metrics: on-time rate, compliance score, average rating
   - Quick actions: New Contract, Add Vehicle, Request Drivers
   - Activity feed
3. **Fleet tab** `(corporate)/(tabs)/fleet.tsx`:
   - Fleet overview: vehicles by type, status (active/maintenance/retired)
   - Vehicle cards with registration, mileage, status
   - Add/manage vehicles
4. **Drivers tab** `(corporate)/(tabs)/drivers.tsx`:
   - Active contracted drivers
   - Driver cards: name, license class, experience, rating, contract status
   - Search/filter drivers for new contracts
5. **Contracts tab** `(corporate)/(tabs)/contracts.tsx`:
   - Active and past service contracts
   - Contract card: provider, duration, status, monthly cost
   - Create new contract request
6. **Profile tab** `(corporate)/(tabs)/profile.tsx`:
   - Company info, billing details, compliance documents
   - Settings, help, logout
7. **Create support screens**:
   - `(corporate)/new-contract.tsx` — contract request form
   - `(corporate)/fleet-detail.tsx` — vehicle detail with maintenance history
   - `(corporate)/driver-detail.tsx` — driver profile with contract history
8. **Create `convex/corporate.ts`** — extend with fleet/contract queries and mutations

## Design

- Corporate = professional, data-dense, efficient
- Use data tables and summary cards
- Status indicators throughout (active/pending/expired)
- Match other dashboards in visual quality

## Rules

- Corporate users manage multiple vehicles and drivers — show counts and summaries
- All data from Convex
- Run `bun run typecheck` and `bun run lint` — fix all errors
