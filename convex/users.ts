import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrThrow } from "./auth";

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Returns the Convex user record for the currently authenticated Clerk user.
 * Returns null if not signed in or no Convex record exists yet.
 */
export const getCurrent = query({
  handler: async (ctx) => {
    return getCurrentUser(ctx);
  },
});

/**
 * Paginated list of users filtered by role.
 * Useful for admin views or marketplace browsing.
 */
export const getByRole = query({
  args: {
    role: v.union(
      v.literal("driver"),
      v.literal("owner"),
      v.literal("client"),
      v.literal("corporate"),
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { role, paginationOpts }) => {
    return ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", role))
      .paginate(paginationOpts);
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Create or update a user record from Clerk auth data.
 *
 * Called automatically when a user signs in (via the useConvexUser hook).
 * - If a user with this clerkId exists → update name and imageUrl.
 * - If new → create with no role and onboardingComplete: false.
 */
export const createOrUpdateFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, email, name, imageUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    const now = Date.now();

    if (existing) {
      // Update existing user's name and image from Clerk
      await ctx.db.patch(existing._id, {
        name: name ?? existing.name,
        imageUrl: imageUrl ?? existing.imageUrl,
        email,
        updatedAt: now,
      });
      return existing._id;
    }

    // Create new user with no role yet
    return ctx.db.insert("users", {
      clerkId,
      email,
      name,
      imageUrl,
      onboardingComplete: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Set the user's role. Called after role selection during onboarding.
 * Only the authenticated user can update their own role.
 */
export const updateRole = mutation({
  args: {
    role: v.union(
      v.literal("driver"),
      v.literal("owner"),
      v.literal("client"),
      v.literal("corporate"),
    ),
  },
  handler: async (ctx, { role }) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, {
      role,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark onboarding as complete or incomplete.
 */
export const updateOnboardingComplete = mutation({
  args: { complete: v.boolean() },
  handler: async (ctx, { complete }) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.patch(user._id, {
      onboardingComplete: complete,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update profile fields (name, phone, location).
 * Only the authenticated user can update their own profile.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.location !== undefined) updates.location = args.location;

    await ctx.db.patch(user._id, updates);
  },
});
