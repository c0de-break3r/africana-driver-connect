Read AGENTS.md fully. The client dashboard is empty — build it from scratch.

Build the complete client dashboard focused on transport booking.

## Current State

`(client)/_layout.tsx` is an empty Stack with an auth guard. No screens exist.

## Tasks

1. **Create tab layout** `(client)/(tabs)/_layout.tsx`:
   - Tabs: Home, Bookings, Search, Messages, Profile
   - Ionicons for tab icons
2. **Home tab** `(client)/(tabs)/index.tsx`:
   - Welcome greeting with user's name
   - Quick occasion cards: Airport, Wedding, Corporate, Daily Commute (from onboarding choices)
   - Upcoming bookings (if any)
   - Recent bookings
3. **Bookings tab** `(client)/(tabs)/bookings.tsx`:
   - List of all bookings from Convex `bookings.getByClient`
   - Booking card: driver name, occasion, date/time, status badge, price
   - Status filter: upcoming, active, completed, cancelled
   - Booking detail → `booking-detail.tsx`
4. **Search tab** `(client)/(tabs)/search.tsx`:
   - Search for drivers/vehicles by occasion type
   - Filter: date, location, vehicle type, price range, rating
   - Results list with driver cards (name, photo, rating, price, vehicle)
   - "Book Now" → booking flow
5. **Messages tab** `(client)/(tabs)/messages.tsx`:
   - Placeholder (chat feature in prompt 26)
   - Friendly empty state
6. **Profile tab** `(client)/(tabs)/profile.tsx`:
   - User info, preferred occasions, booking history stats
   - Settings, payment methods, help, logout
7. **Create support screens**:
   - `(client)/booking-detail.tsx` — booking details with status timeline, driver info, vehicle, map link
   - `(client)/book-driver.tsx` — booking confirmation: select date/time, add notes, price estimate, confirm
   - `(client)/search-results.tsx` — filtered search results
8. **Create `convex/bookings.ts`** — replace placeholder with real booking functions

## Design

- Client-facing = premium, trustworthy, easy to book
- Occasion cards with icons and short descriptions
- Booking status timeline: pending → confirmed → in-progress → completed
- Green/yellow/red status badges

## Rules

- Occasion type drives the booking experience (AGENTS.md)
- Use Convex for all data
- Run `bun run typecheck` and `bun run lint` — fix all errors
