Read AGENTS.md fully.

Build the subscription system for premium features.

## Tasks

1. **Add `subscriptions` table to Convex schema**:
   - `userId` (ref users, indexed)
   - `plan` (union: "free", "driver_pro", "owner_premium", "corporate_enterprise")
   - `status` (union: "active", "cancelled", "expired", "trial")
   - `startedAt`, `expiresAt`, `cancelledAt?`
   - `autoRenew` (boolean)
   - `price` (number), `currency` (string), `interval` (union: "monthly", "yearly")
2. **Add `planFeatures` data** — typed feature flags per plan:
   - Free: 5 applications/month, basic search, standard support
   - Driver Pro: unlimited applications, priority matching, analytics, premium badge
   - Owner Premium: unlimited job posts, featured listings, driver recommendations
   - Corporate Enterprise: unlimited everything, dedicated support, API access
3. **Create `convex/subscriptions.ts`**:
   - `getCurrent(userId)` — active subscription or free tier
   - `getPlanFeatures(plan)` — feature flags for a plan
   - `subscribe(userId, plan, interval)` — create subscription (triggers payment)
   - `cancel(userId)` — cancel with end-of-period expiry
   - `checkFeature(userId, feature)` — returns boolean (can user access this feature?)
4. **Create `convex/payments-subscription.ts`** (Action):
   - `processSubscriptionPayment(userId, plan, interval)` — recurring payment via provider
5. **Create subscription UI**:
   - `(driver)/subscription.tsx` — plan comparison, upgrade CTA
   - `(owner)/subscription.tsx` — plan comparison, upgrade CTA
   - `components/plan-card.tsx` — plan name, price, features list, CTA button
   - `components/feature-gate.tsx` — wrapper that shows upgrade prompt when feature is locked

## Rules

- Subscription status checked before premium actions (posting extra jobs, priority matching)
- Never block core functionality — free tier always works for basic use
- Run `bun run typecheck` and `bun run lint` — fix all errors
