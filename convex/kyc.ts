import { v } from "convex/values";
import { mutation, query } from "convex/functions";

/**
 * Submit KYC documents to Dojah for verification
 * Stores document URIs and initiates verification process
 */
export const submitKycDocuments = mutation({
  args: {
    userId: v.id("users"),
    documentFrontUri: v.string(),
    documentBackUri: v.string(),
    documentType: v.union(
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("national_id"),
    ),
  },
  returns: v.object({
    verificationId: v.string(),
    status: v.literal("processing"),
  }),
  handler: async (ctx, args) => {
    const driver = await ctx.db.query("drivers")
      .withIndex("by_user", (d) => d.userId === args.userId)
      .first();

    if (!driver) {
      throw new Error("Driver not found");
    }

    const verificationId = `verif_${Date.now()}`;

    await ctx.db.patch(driver._id, {
      kycStatus: "processing",
      nationalIdFrontStorageId: args.documentFrontUri,
      nationalIdBackStorageId: args.documentBackUri,
    });

    await ctx.db.insert("verifications", {
      userId: args.userId,
      type: "identity",
      provider: "dojah",
      status: "processing",
      providerId: verificationId,
      frontStorageId: args.documentFrontUri,
      backStorageId: args.documentBackUri,
      submittedAt: Date.now(),
    });

    return {
      verificationId,
      status: "processing",
    };
  },
});

/**
 * Submit selfie for facial verification
 */
export const submitSelfie = mutation({
  args: {
    userId: v.id("users"),
    selfieUri: v.string(),
  },
  returns: v.object({
    verificationId: v.string(),
    status: v.literal("processing"),
  }),
  handler: async (ctx, args) => {
    const driver = await ctx.db.query("drivers")
      .withIndex("by_user", (d) => d.userId === args.userId)
      .first();

    if (!driver) {
      throw new Error("Driver not found");
    }

    const verificationId = `liveness_${Date.now()}`;

    await ctx.db.patch(driver._id, {
      selfieStorageId: args.selfieUri,
      kycStatus: "processing",
    });

    return {
      verificationId,
      status: "processing",
    };
  },
});

/**
 * Update KYC verification status
 */
export const updateKycStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.union(
      v.literal("not_started"),
      v.literal("capturing"),
      v.literal("processing"),
      v.literal("review"),
      v.literal("confirmed"),
      v.literal("failed"),
    ),
    failureReason: v.optional(v.string()),
  },
  returns: v.null,
  handler: async (ctx, args) => {
    const driver = await ctx.db.query("drivers")
      .withIndex("by_user", (d) => d.userId === args.userId)
      .first();

    if (!driver) {
      throw new Error("Driver not found");
    }

    await ctx.db.patch(driver._id, {
      kycStatus: args.status,
    });

    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_user", (v) => v.userId === args.userId)
      .collect();

    if (verification.length > 0) {
      await ctx.db.patch(verification[verification.length - 1]._id, {
        status: args.status === "confirmed" ? "verified" : args.status === "failed" ? "rejected" : "pending",
        completedAt: args.status === "confirmed" || args.status === "failed" ? Date.now() : undefined,
        rejectionReason: args.failureReason,
      });
    }

    return null;
  },
});

/**
 * Get driver KYC status
 */
export const getDriverKycStatus = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    kycStatus: v.union(
      v.literal("not_started"),
      v.literal("capturing"),
      v.literal("processing"),
      v.literal("review"),
      v.literal("confirmed"),
      v.literal("failed"),
    ),
    faceMatchPassed: v.union(v.boolean(), v.null()),
    faceMatchConfidence: v.union(v.float64(), v.null()),
  }),
  handler: async (ctx, args) => {
    const driver = await ctx.db.query("drivers")
      .withIndex("by_user", (d) => d.userId === args.userId)
      .first();

    if (!driver) {
      return {
        kycStatus: "not_started",
        faceMatchPassed: null,
        faceMatchConfidence: null,
      };
    }

    return {
      kycStatus: driver.kycStatus ?? "not_started",
      faceMatchPassed: driver.faceMatchPassed ?? null,
      faceMatchConfidence: driver.faceMatchConfidence ?? null,
    };
  },
});