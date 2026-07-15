Read AGENTS.md fully — use backend for matching logic (proximity, rating, cost, experience).

Build the driver search and discovery experience for clients and owners.

## Current State

Client dashboard (prompt 16) includes a search tab with placeholder UI. Convex has `drivers.getVerified` query.

## Tasks

1. **Extend `convex/drivers.ts`**:
   - `search({ query, location?, vehicleType?, licenseClass?, minRating?, sort?, paginationOpts })` — full-text search with filters and sorting
   - `getTopRated(paginationOpts)` — highest-rated drivers
   - `getNearby(lat, lng, radiusKm, paginationOpts)` — drivers within radius (requires location data)
   - `getAvailable(date, occasionType, paginationOpts)` — drivers free on a specific date for an occasion
2. **Add location to driver profiles**:
   - Update `convex/drivers.ts` schema or add lat/lng fields for proximity search
   - Create `src/hooks/useDriverLocation.ts` — request location permission, update Convex with current position
3. **Create search components**:
   - `components/driver-card.tsx` — driver search result card (photo, name, rating, experience, vehicle types, hourly rate, distance)
   - `components/search-filters.tsx` — filter sheet: vehicle type, rating, price range, availability date, distance
   - `components/rating-stars.tsx` — reusable star rating display
4. **Create screens**:
   - `(client)/(tabs)/search.tsx` — search input + filters + paginated results
   - `(client)/driver-profile.tsx` — public driver profile: bio, ratings, reviews, vehicle photos, "Book" button
5. **Create `src/hooks/useDriverSearch.ts`** — search state, debounced input, filter management

## Rules

- Search must be debounced (300ms) to avoid excessive queries
- Use Convex pagination — never load all results at once
- Location data is sensitive — only share approximate location with clients
- Run `bun run typecheck` and `bun run lint` — fix all errors
