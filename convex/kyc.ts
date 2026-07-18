import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

const DOJAH_BASE_URL = "https://api.dojah.io";

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
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      throw new Error("Driver profile not found");
    }

    const verificationId = `verif_${Date.now()}`;

    // Get Dojah credentials from environment
    const dojahAppId = process.env.DOJAH_APP_ID;
    const dojahSecretKey = process.env.DOJAH_SECRET_KEY;
    
    if (!dojahAppId || !dojahSecretKey) {
      throw new Error("Dojah credentials not configured");
    }

    // Encode credentials using btoa (Convex-compatible)
    const credentials = btoa(`${dojahAppId}:${dojahSecretKey}`);

    // Call Dojah API
    const dojahResponse = await fetch(`${DOJAH_BASE_URL}/v1/verification/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        document_type: args.documentType,
        document_front: args.documentFrontUri,
        document_back: args.documentBackUri,
      }),
    });

    const dojahData = await dojahResponse.json();

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
      userId: user._id,
      type: args.documentType === "national_id" ? "national_id" : "license",
      provider: "dojah",
      status: "submitted",
      providerId: dojahData?.entity_id || verificationId,
      frontStorageId: args.documentFrontUri,
      backStorageId: args.documentBackUri,
      submittedAt: Date.now(),
    });

    return {
      verificationId,
      status: "submitted" as "submitted",
    };
  },
});

/**
 * Submit selfie for facial verification via Dojah
 */
export const submitSelfie = mutation({
  args: {
    selfieUri: v.string(),
    documentFrontUri: v.string(),
    documentType: v.union(
      v.literal("passport"),
      v.literal("drivers_license"),
      v.literal("national_id"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      throw new Error("Driver profile not found");
    }

    const verificationId = `liveness_${Date.now()}`;

    // Get Dojah credentials from environment
    const dojahAppId = process.env.DOJAH_APP_ID;
    const dojahSecretKey = process.env.DOJAH_SECRET_KEY;
    
    if (!dojahAppId || !dojahSecretKey) {
      throw new Error("Dojah credentials not configured");
    }

    // Encode credentials using btoa (Convex-compatible)
    const credentials = btoa(`${dojahAppId}:${dojahSecretKey}`);

    // Call Dojah Biometric API
    const dojahResponse = await fetch(`${DOJAH_BASE_URL}/v1/verification/biometric`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        selfie: args.selfieUri,
        document_type: args.documentType,
        document_number: driver.licenseNumber || "",
      }),
    });

    const dojahData = await dojahResponse.json();

    await ctx.db.patch(driver._id, {
      selfieStorageId: args.selfieUri,
      kycStatus: "submitted",
      faceMatchPassed: dojahData?.data?.face_match_score > 80 ? true : false,
      faceMatchConfidence: dojahData?.data?.face_match_score,
    });

    await ctx.db.insert("verifications", {
      userId: user._id,
      type: "facial_match",
      provider: "dojah",
      status: "submitted",
      providerId: verificationId,
      selfieStorageId: args.selfieUri,
      submittedAt: Date.now(),
    });

    return {
      verificationId,
      status: "submitted" as "submitted",
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
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.verificationId))
      .unique();

    if (!verification) {
      throw new Error("Verification not found");
    }

    if (verification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Map status to verification status
    const newVerificationStatus: "pending" | "in_progress" | "submitted" | "pending_review" | "verified" | "rejected" | "expired" = 
      args.status === "verified" 
        ? "verified" 
        : args.status === "rejected" 
          ? "rejected" 
          : args.status === "expired" 
            ? "expired" 
            : "pending_review";

    await ctx.db.patch(verification._id, {
      status: newVerificationStatus,
      completedAt: newVerificationStatus === "verified" || newVerificationStatus === "rejected" ? Date.now() : undefined,
      rejectionReason: args.failureReason,
    });

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

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
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      return {
        kycStatus: "not_started" as const,
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

/**
 * Dojah webhook handler for verification updates
 * Called by Dojah when verification status changes
 * Internal function called by HTTP endpoint
 */
export const handleDojahWebhook = internalMutation({
  args: {
    entityId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("failed"),
    ),
    data: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db
      .query("verifications")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.entityId))
      .unique();

    if (!verification) {
      console.warn(`Verification not found for entity: ${args.entityId}`);
      return null;
    }

    // Map Dojah status to our status
    const statusMap: Record<string, string> = {
      pending: "pending_review",
      verified: "verified",
      rejected: "rejected",
      failed: "rejected",
    };

    const mappedStatus = statusMap[args.status] || "pending_review";

    const newVerificationStatus: "pending" | "pending_review" | "verified" | "rejected" | "expired" = 
      mappedStatus as "pending" | "pending_review" | "verified" | "rejected" | "expired";

    await ctx.db.patch(verification._id, {
      status: newVerificationStatus,
      completedAt: newVerificationStatus === "verified" || newVerificationStatus === "rejected" ? Date.now() : undefined,
      extractedData: args.data ? JSON.stringify(args.data) : undefined,
    });

    // Update driver status
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", verification.userId))
      .unique();

    if (driver) {
      await ctx.db.patch(driver._id, {
        kycStatus: mappedStatus as "pending_review" | "verified" | "rejected" | "expired",
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});
