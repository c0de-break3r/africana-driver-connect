import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * List all vehicles registered by a specific owner.
 */
export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    return ctx.db
      .query("vehicles")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Register a new vehicle under the authenticated owner.
 */
export const register = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    type: v.string(),
    plateNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    return ctx.db.insert("vehicles", {
      ownerId: user._id,
      make: args.make,
      model: args.model,
      year: args.year,
      type: args.type,
      plateNumber: args.plateNumber,
      registrationStatus: "pending",
      documents: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});
