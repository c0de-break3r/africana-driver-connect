Read AGENTS.md fully — security is critical for a marketplace handling payments and identity verification.

Audit and harden the app's security posture.

## Tasks

1. **Client-side security audit**:
   - Search for any `EXPO_PUBLIC_*` env vars containing secrets (MetaMap, payment keys)
   - Ensure no API keys, tokens, or credentials exist in source code
   - Check that `.env` and `.env.local` are in `.gitignore`
   - Audit Clerk publishable key usage (should be publishable, not secret)
2. **Convex function security**:
   - Every mutation must call `getCurrentUserOrThrow(ctx)` — reject unauthenticated calls
   - Every mutation must verify resource ownership (driver can only update their profile, owner can only close their jobs)
   - Add role checks where needed (only drivers can apply to jobs, only clients can create bookings)
   - Validate all input with `v` validators — no raw `any` types
   - Rate-limit sensitive mutations (job applications, booking creation) using Convex rate limiting
3. **Auth security**:
   - Verify all route groups have auth guards
   - Test deep-link bypass: navigate directly to `/(driver)` while signed out — should redirect
   - Ensure Clerk session tokens are properly validated on every Convex call
   - Implement session timeout for sensitive operations (payments, profile changes)
4. **Data security**:
   - Sensitive fields (phone numbers, exact location) should not be exposed to non-participants
   - Driver license photos only visible to driver and admin
   - Payment details never returned to client (only status)
   - Conversation messages only visible to participants
5. **Input validation**:
   - All form inputs validated client-side (UX) and server-side (security)
   - File uploads: validate type, size, and content
   - Prevent XSS in user-generated content (names, messages, job descriptions)
6. **Create `convex/security.ts`**:
   - `isOwner(userId, resourceId, resourceType)` — generic ownership check helper
   - `isRole(userId, requiredRole)` — role verification helper
   - `rateLimit(userId, action, windowMs, maxCalls)` — rate limiting helper

## Security Checklist

- [ ] No secrets in client-side code
- [ ] All mutations authenticated
- [ ] All mutations authorized (ownership verified)
- [ ] All inputs validated
- [ ] Route guards on all protected groups
- [ ] Sensitive data access restricted
- [ ] Rate limiting on high-value actions
- [ ] `.env` files in `.gitignore`

## Rules

- Security is never optional — fix critical issues immediately
- Document any accepted risks
- Run `bun run typecheck` and `bun run lint` — fix all errors
