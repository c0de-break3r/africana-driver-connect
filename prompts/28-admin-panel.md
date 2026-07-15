Read AGENTS.md fully.

Build an admin panel for platform management, moderation, and analytics.

## Tasks

1. **Add `adminUsers` table to Convex schema**:
   - `userId` (ref users, indexed)
   - `role` (union: "admin", "moderator", "support")
   - `permissions` (array of strings: "manage_users", "manage_bookings", "manage_disputes", "view_analytics", "manage_content")
   - `createdAt` (number)
2. **Create `convex/admin.ts`** (admin-only queries and mutations):
   - `getUsers(paginationOpts, role?, status?)` — all users with filters
   - `getUserDetail(userId)` — full profile with driver/owner/client data, bookings, ratings
   - `suspendUser(userId, reason)` — disable account
   - `reactivateUser(userId)` — re-enable account
   - `getBookings(paginationOpts, status?)` — all bookings with filters
   - `getDisputes(paginationOpts, status?)` — all disputed bookings
   - `resolveDispute(disputeId, resolution, notes)` — admin resolves a dispute
   - `getPlatformStats(startDate, endDate)` — total users, bookings, revenue, commission, active drivers
3. **Create `convex/admin-analytics.ts`**:
   - `getGrowthMetrics(period)` — new users, bookings, revenue over time
   - `getDriverLeaderboard(limit)` — top drivers by rating/trips/earnings
   - `getCategoryBreakdown()` — bookings by occasion type, jobs by category
4. **Create admin screens** (separate route group or web app):
   - `app/(admin)/_layout.tsx` — admin layout with auth guard + role check
   - `app/(admin)/(tabs)/index.tsx` — dashboard overview with key metrics
   - `app/(admin)/users.tsx` — user management list
   - `app/(admin)/bookings.tsx` — booking management
   - `app/(admin)/disputes.tsx` — dispute resolution queue
   - `app/(admin)/analytics.tsx` — charts and metrics
5. **Create admin components**:
   - `components/admin/user-row.tsx` — user list item with actions
   - `components/admin/metric-card.tsx` — KPI card (total, change %, trend)
   - `components/admin/dispute-detail.tsx` — booking details, both sides, resolution form

## Rules

- Admin routes require admin role — check in layout guard
- Admin actions are mutations with role verification (never trust client)
- Consider building admin as a separate web app (Convex dashboard) instead of in-app
- Run `bun run typecheck` and `bun run lint` — fix all errors
