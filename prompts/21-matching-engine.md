Read AGENTS.md fully — matching logic belongs on the server side.

Build the smart matching engine that automatically connects clients/owners with the best drivers.

## Current State

No matching logic exists. Search (prompt 20) provides manual discovery. Matching automates this.

## Tasks

1. **Create `convex/matching.ts`** (Convex queries — server-side logic):
   - `getMatches({ clientId, occasionType, date, location?, preferences? })` — returns ranked driver list
   - Scoring algorithm (weighted):
     - **Proximity** (30%) — distance from client's location to driver's preferred area
     - **Rating** (25%) — average rating from `ratings` table
     - **Availability** (20%) — driver has no conflicting bookings on the requested date
     - **Experience** (15%) — years of experience + relevant vehicle type
     - **Cost** (10%) — driver's rate vs client's budget
   - Returns top 10 matches with match score and breakdown
2. **Create `convex/scheduled-matching.ts`** (scheduled function):
   - Run daily — for upcoming bookings without assigned drivers, auto-suggest matches
   - Create notifications for matched drivers: "New booking match available"
3. **Create matching UI components**:
   - `components/match-card.tsx` — driver card with match percentage, score breakdown, "Request Booking" button
   - `components/match-results.tsx` — ranked list of matches with expand/collapse for score details
4. **Create screens**:
   - `(client)/find-matches.tsx` — enter occasion details, see auto-matched drivers
   - Integrate into client booking flow: after occasion/date selection, show matches before manual search
5. **Create `src/hooks/useMatching.ts`** — match request state and results

## Rules

- Matching is a suggestion, not a booking — client must confirm
- All matching logic runs server-side in Convex (AGENTS.md: "matching engine logic belongs on backend")
- Never expose driver's exact location to clients until booking confirmed
- Run `bun run typecheck` and `bun run lint` — fix all errors
