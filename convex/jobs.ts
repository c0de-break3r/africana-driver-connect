import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Paginated list of open jobs.
 */
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    return ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .order("desc")
      .paginate(paginationOpts);
  },
});

/**
 * Get all applications for a specific job.
 * Only the job owner can view applications.
 */
export const getApplications = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const job = await ctx.db.get(jobId);

    if (!job) throw new Error("Job not found.");
    if (job.ownerId !== user._id) {
      throw new Error("Only the job owner can view applications.");
    }

    return ctx.db
      .query("jobApplications")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .collect();
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Post a new job. Only authenticated owners can create jobs.
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    location: v.string(),
    payMin: v.optional(v.number()),
    payMax: v.optional(v.number()),
    payCurrency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const now = Date.now();

    return ctx.db.insert("jobs", {
      ownerId: user._id,
      title: args.title,
      description: args.description,
      category: args.category,
      location: args.location,
      payMin: args.payMin,
      payMax: args.payMax,
      payCurrency: args.payCurrency ?? "GHS",
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Apply to a job. Only authenticated drivers can apply.
 */
export const apply = mutation({
  args: {
    jobId: v.id("jobs"),
    coverNote: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, coverNote }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const job = await ctx.db.get(jobId);

    if (!job) throw new Error("Job not found.");
    if (job.status !== "open") throw new Error("This job is no longer open.");

    // Check for duplicate application
    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_job", (q) => q.eq("jobId", jobId))
      .filter((q) => q.eq(q.field("driverId"), user._id))
      .first();

    if (existing) {
      throw new Error("You have already applied to this job.");
    }

    const now = Date.now();
    return ctx.db.insert("jobApplications", {
      jobId,
      driverId: user._id,
      coverNote,
      status: "pending",
      appliedAt: now,
      updatedAt: now,
    });
  },
});
