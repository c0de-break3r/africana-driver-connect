import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Look up the Convex user record for the currently authenticated Clerk user.
 *
 * Clerk sets the JWT token on every request. Convex exposes the token
 * identifier via `ctx.auth.tokenIdentifier`, which we extract the Clerk
 * user ID from. We then look up the matching `users` row by `clerkId`.
 *
 * Returns `null` if the user is not signed in or has no Convex record yet.
 */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  // Clerk token identifier format: "https://<domain>|<clerkUserId>"
  // The subject (sub) claim is the Clerk user ID.
  const clerkId = identity.subject;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  return user ?? null;
}

/**
 * Same as getCurrentUser but throws if the user is not authenticated.
 * Use this in mutations/queries that require a signed-in user.
 */
export async function getCurrentUserOrThrow(
  ctx: QueryCtx | MutationCtx,
) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated. Please sign in first.");
  }
  return user;
}
