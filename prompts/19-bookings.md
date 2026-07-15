Read AGENTS.md fully. Bookings are the core client-to-driver transaction.

Build the complete booking system with status tracking.

## Current State

Convex schema has a `bookings` table with status union (pending, confirmed, in_progress, completed, cancelled, disputed). `convex/bookings.ts` is a placeholder with comments only.

## Tasks

1. **Implement `convex/bookings.ts`**:
   - `create({ driverId, vehicleId?, occasionType, scheduledAt, price?, currency?, notes? })` — client creates booking request
   - `getById(bookingId)` — full booking detail with driver and vehicle info (joined)
   - `getByClient(clientId, paginationOpts, status?)` — client's bookings with optional status filter
   - `getByDriver(driverId, paginationOpts, status?)` — driver's bookings
   - `updateStatus(bookingId, status)` — driver accepts/rejects, mark in-progress/completed (verify ownership)
   - `cancel(bookingId, reason)` — either party can cancel (verify ownership)
   - `getActive(userId)` — currently active bookings (confirmed or in_progress) for real-time tracking
   - `getUpcoming(userId)` — future confirmed bookings
2. **Create booking components**:
   - `components/booking-card.tsx` — driver/client name, occasion, date, status badge, price
   - `components/booking-status-timeline.tsx` — visual timeline: pending → confirmed → in-progress → completed
   - `components/occasion-picker.tsx` — grid of occasion type cards for booking
3. **Create screens**:
   - `(client)/book-driver.tsx` — select date/time, occasion, vehicle preference, add notes, price estimate, confirm
   - `(client)/booking-detail.tsx` — full details, status timeline, driver info, contact buttons, cancel
   - `(driver)/booking-detail.tsx` — driver view: client info, pickup location, accept/decline, start/complete trip
4. **Create `src/hooks/useBookings.ts`** — booking state management and Convex calls
5. **Add booking notifications** — create notification on status change (pending, confirmed, completed)

## Booking Status Flow

```
pending → confirmed → in_progress → completed
  ↓         ↓           ↓
cancelled  cancelled  cancelled (with reason)
                        ↓
                      disputed
```

## Rules

- Only the client can create a booking
- Only the driver can accept/reject a pending booking
- Only the assigned driver can mark in-progress/completed
- Either party can cancel (with different reasons)
- Price is estimated at creation, finalized at completion
- Run `bun run typecheck` and `bun run lint` — fix all errors
