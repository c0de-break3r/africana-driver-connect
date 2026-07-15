import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Get an owner profile by their users table ID.
 */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("owners")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Create an owner profile for the currently authenticated user.
 */
export const createProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    vehicleCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const existing = await ctx.db
      .query("owners")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const now = Date.now();
    return ctx.db.insert("owners", {
      userId: user._id,
      companyName: args.companyName,
      vehicleCount: args.vehicleCount,
      createdAt: now,
      updatedAt: now,
    });
  },
});
