Read AGENTS.md fully.

Establish ongoing maintenance practices for the app.

## Tasks

1. **Monitoring setup**:
   - Add error tracking (Sentry or Bugsnag) for crash reporting
   - Add analytics (PostHog or Mixpanel) for usage tracking
   - Convex dashboard monitoring: set up alerts for function errors and slow queries
   - Monitor Clerk auth events: sign-in failures, suspicious activity
2. **Logging**:
   - Create `src/lib/logger.ts` — structured logging utility (debug, info, warn, error)
   - Log Convex function calls with timing (server-side)
   - Log client errors with context (user ID, screen, action)
   - Never log sensitive data (tokens, passwords, payment info)
3. **Dependency maintenance**:
   - Run `npx expo install --check` monthly to update Expo packages
   - Run `npx convex dev` to keep Convex deployment in sync
   - Audit dependencies for security vulnerabilities: `npm audit`
   - Update Clerk SDK when new versions release (security patches)
4. **Database maintenance**:
   - Convex data retention policy: archive old bookings, expired jobs
   - Index optimization: review query patterns and add compound indexes
   - Storage cleanup: delete orphaned files (no longer referenced by any table)
   - Scheduled function for data archival (bookings older than 1 year)
5. **Backup strategy**:
   - Convex automated backups (built-in)
   - Export critical data periodically (users, bookings, payments)
   - Document recovery procedure
6. **Documentation maintenance**:
   - Keep AGENTS.md updated as architecture evolves
   - Document all Convex functions with JSDoc comments
   - Maintain changelog for each release
   - Update prompt files as features are built
7. **Performance monitoring**:
   - Track key metrics: app launch time, API latency, crash rate
   - Set up alerts for regression (crash rate > 1%, P95 latency > 2s)
   - Monthly performance audit (review prompt 30)

## Maintenance Schedule

| Task                      | Frequency   |
| ------------------------- | ----------- |
| Dependency updates        | Monthly     |
| Security audit            | Monthly     |
| Performance audit         | Monthly     |
| Database cleanup          | Quarterly   |
| Full test suite run       | Weekly (CI) |
| Convex deployment review  | Per release |
| App store metadata update | Per release |

## Rules

- Never skip security updates
- Always test in staging before production
- Document every breaking change
- Run `bun run typecheck` and `bun run lint` before any release
