Read AGENTS.md fully — use backend/serverless for API keys and matching logic.

Implement push notifications and in-app notification system using Expo notifications and Convex.

## Tasks

1. **Install** `expo-notifications` (if not already installed)
2. **Create `convex/notifications.ts`** — replace placeholder with real functions:
   - `create` (internal mutation) — create a notification record
   - `getByUser(paginationOpts)` — paginated notification list with read/unread filter
   - `markRead(notificationId)` — mark one as read
   - `markAllRead()` — mark all as read
   - `getUnreadCount()` — badge count for tab bar
3. **Create `src/hooks/useNotifications.ts`**:
   - Request notification permissions (with context-first framing per AGENTS.md UX)
   - Register device push token with Convex
   - Handle foreground notifications (show in-app banner)
   - Handle notification taps (navigate to relevant screen)
4. **Create Convex scheduled functions** for:
   - Booking reminders (24h and 1h before scheduled time)
   - Job application status changes
   - New job alerts for drivers matching criteria
5. **Update notifications tab** (`(driver)/(tabs)/notifications.tsx`) — replace placeholder with real Convex query, read/unread states, pull-to-refresh
6. **Add notification badge** to tab bar icons showing unread count

## Notification Types

- `booking_request` — driver receives a booking request
- `booking_confirmed` — client's booking is confirmed
- `job_posted` — new job matching driver's preferences
- `application_update` — driver's application accepted/rejected
- `verification_complete` — document verification finished
- `payment_received` — payment processed
- `message` — new chat message

## Rules

- Never show a raw OS permission prompt — always frame with context first
- Notifications must be real-time via Convex subscriptions
- Run `bun run typecheck` and `bun run lint` — fix all errors
