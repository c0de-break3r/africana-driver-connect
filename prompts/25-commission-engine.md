Read AGENTS.md fully.

Build the commission engine that calculates platform fees on every transaction.

## Dependencies

- Prompt 19 (bookings) — commission calculated on completed bookings
- Prompt 22 (wallet) — commission deducted from driver payout
- Prompt 24 (subscriptions) — commission rate varies by plan

## Tasks

1. **Add `commissions` table to Convex schema**:
   - `bookingId` (ref bookings, indexed)
   - `driverId` (ref users)
   - `clientId` (ref users)
   - `bookingAmount` (number)
   - `commissionRate` (number — percentage, e.g. 0.15 for 15%)
   - `commissionAmount` (number)
   - `driverPayout` (number — bookingAmount - commissionAmount)
   - `status` (union: "pending", "collected", "refunded")
   - `collectedAt?` (number)
   - `createdAt` (number)
2. **Create `convex/commission.ts`**:
   - `calculateRate(userId)` — returns commission rate based on subscription plan:
     - Free drivers: 15%
     - Driver Pro: 10%
     - Owner Premium: 8% (owner pays, driver gets more)
     - Corporate Enterprise: 5%
   - `applyCommission(bookingId)` — called when booking completes. Calculate rate, deduct commission, release net to driver wallet
   - `getByBooking(bookingId)` — commission details for a booking
   - `getRevenue(startDate, endDate)` — admin query: total commission collected in period
   - `getDriverEarnings(driverId, startDate, endDate)` — driver's net earnings after commission
3. **Create `convex/commission-scheduled.ts`**:
   - Monthly revenue report generation
   - Auto-collect pending commissions older than 48 hours
4. **Create commission UI**:
   - `(driver)/earnings.tsx` — gross earnings, commission paid, net earnings, breakdown by booking
   - `(owner)/spending.tsx` — total spent, platform fees, breakdown by booking
   - `components/earnings-summary.tsx` — chart/card showing earnings over time

## Commission Flow

```
Booking completed → calculateRate() → applyCommission()
  → Deduct commission from escrow
  → Release (bookingAmount - commissionAmount) to driver wallet
  → Create commission record
```

## Rules

- Commission is calculated and deducted atomically — driver never sees gross amount
- Commission rates are configurable via Convex env vars or database
- All commission calculations happen server-side
- Run `bun run typecheck` and `bun run lint` — fix all errors
