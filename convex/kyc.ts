import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit KYC documents to Dojah for verification
 * Stores document URIs and initiates verification process
 */
export const submitKycDocuments = mutation({
  args: {
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
    status: v.literal("submitted"),
  }),
  handler: async (ctx, args) => {
    const user = ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthenticated");
    }

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .first();

    if (!driver) {
      throw new Error("Driver not found");
    }

    const verificationId = `verif_${Date.now()}`;

    const storageFields: Record<string, string | undefined> = {};
    if (args.documentType === "national_id") {
      storageFields.nationalIdFrontStorageId = args.documentFrontUri;
      storageFields.nationalIdBackStorageId = args.documentBackUri;
    } else if (args.documentType === "passport" || args.documentType === "drivers_license") {
      storageFields.licenseFrontStorageId = args.documentFrontUri;
      storageFields.licenseBackStorageId = args.documentBackUri;
    } else {
      throw new Error(`Unsupported document type: ${args.documentType}`);
    }

    await ctx.db.patch(driver._id, {
      kycStatus: "in_progress",
      ...storageFields,
    });

    await ctx.db.insert("verifications", {
      userId: user.subject,
      type: args.documentType === "national_id" ? "national_id" : "license",
      provider: "dojah",
      status: "submitted",
      providerId: verificationId,
      frontStorageId: args.documentFrontUri,
      backStorageId: args.documentBackUri,
      submittedAt: Date.now(),
    });

    return {
      verificationId,
      status: "submitted",
    };
  },
});

/**
 * Submit selfie for facial verification
 */
export const submitSelfie = mutation({
  args: {
    selfieUri: v.string(),
  },
  returns: v.object({
    verificationId: v.string(),
    status: v.literal("submitted"),
  }),
  handler: async (ctx, args) => {
    const user = ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthenticated");
    }

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .first();

    if (!driver) {
      throw new Error("Driver not found");
    }

    const verificationId = `liveness_${Date.now()}`;

    await ctx.db.patch(driver._id, {
      selfieStorageId: args.selfieUri,
      kycStatus: "submitted",
    });

    await ctx.db.insert("verifications", {
      userId: user.subject,
      type: "facial_match",
      provider: "dojah",
      status: "submitted",
      providerId: verificationId,
      selfieStorageId: args.selfieUri,
      submittedAt: Date.now(),
    });

    return {
      verificationId,
      status: "submitted",
    };
  },
});

/**
 * Update KYC verification status
 * Can be called by authenticated user or internal webhook
 */
export const updateKycStatus = mutation({
  args: {
    verificationId: v.string(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    failureReason: v.optional(v.string()),
  },
  returns: v.null,
  handler: async (ctx, args) => {
    const user = ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthenticated");
    }

    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.verificationId))
      .first();

    if (!verification) {
      throw new Error("Verification not found");
    }

    if (verification.userId !== user.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(verification._id, {
      status: args.status === "verified" ? "verified" : args.status === "rejected" ? "rejected" : args.status === "expired" ? "expired" : "pending_review",
      completedAt: args.status === "verified" || args.status === "rejected" || args.status === "expired" ? Date.now() : undefined,
      rejectionReason: args.failureReason,
    });

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
      .first();

    if (driver) {
      await ctx.db.patch(driver._id, {
        kycStatus: args.status,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

/**
 * Get driver KYC status
 */
export const getDriverKycStatus = query({
  args: {},
  returns: v.object({
    kycStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    faceMatchPassed: v.union(v.boolean(), v.null()),
    faceMatchConfidence: v.union(v.float64(), v.null()),
  }),
  handler: async (ctx) => {
    const user = ctx.auth.getUserIdentity();
    if (!user) {
      return {
        kycStatus: "not_started",
        faceMatchPassed: null,
        faceMatchConfidence: null,
      };
    }

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user.subject))
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