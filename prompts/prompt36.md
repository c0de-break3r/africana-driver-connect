Read AGENTS.md fully and strictly follow it before starting.

Build a separate admin-only route/app section (can be a lightweight web view or protected route group):

- User Management: approve, suspend, delete users
- Driver Verification: review uploaded documents, approve/reject drivers
- Financial Management: commission tracking, settlement management
- Analytics: revenue dashboard, user growth, bookings dashboard (placeholder charts)

Gate this entirely behind an admin role check via Clerk — never expose admin routes to standard users.

CRITICAL: Every backend handler serving the admin section must perform server-side Clerk admin-role verification before executing any action or returning protected data. This includes user approval/suspension/deletion, driver document review/decisions, commission/settlement operations, and analytics requests. Do not rely solely on client-side route gating — reject unauthorized requests at the backend before performing any operation.
