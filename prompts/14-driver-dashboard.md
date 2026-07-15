Read AGENTS.md fully. Read existing driver dashboard files in `(driver)/`.

Replace placeholder data in the driver dashboard with real Convex-powered content.

## Current State

Driver dashboard has 5 tab screens with placeholder/hardcoded data: Home (earnings stats, upcoming jobs), Jobs (mock list), Messages (empty), Notifications (mock list), Profile (static items). All use hardcoded arrays.

## Tasks

1. **Home tab** (`(driver)/(tabs)/index.tsx`):
   - Replace hardcoded stats with Convex queries: today's earnings, weekly trips, current rating, active bookings
   - Add `convex/dashboard.ts` → `drivers.getHomeStats(userId)` query
   - Show "Complete your profile" banner if `verificationStatus !== "verified"`
   - Show upcoming bookings (real-time via Convex subscriptions)
   - Show recent job matches nearby
2. **Jobs tab** (`(driver)/(tabs)/jobs.tsx`):
   - Replace placeholder list with paginated Convex query for open jobs matching driver's preferences
   - Add filter/sort: distance, pay, category, date posted
   - "Apply" button calls `jobs.apply` mutation
   - Show application status (pending/accepted/rejected) for applied jobs
3. **Messages tab** (`(driver)/(tabs)/messages.tsx`):
   - Keep as placeholder (chat feature comes in prompt 26)
   - Add friendly empty state: "No messages yet"
4. **Notifications tab** (`(driver)/(tabs)/notifications.tsx`):
   - Replace mock data with real Convex notifications query
   - Pull-to-refresh, mark read, mark all read
5. **Profile tab** (`(driver)/(tabs)/profile.tsx`):
   - Show real user data from Convex `users` table
   - Verification status badge (pending/verified/rejected)
   - Link to `complete-profile.tsx` for document uploads
   - Edit profile → settings screen
6. **Create `src/hooks/useDriverDashboard.ts`** — aggregates all dashboard queries

## Rules

- Use Convex reactive queries (`useQuery`) for real-time updates
- Use design tokens from `global.css`
- Match existing tab layout and Ionicons
- Run `bun run typecheck` and `bun run lint` — fix all errors
