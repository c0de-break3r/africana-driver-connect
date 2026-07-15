import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";
// ─── Queries ──────────────────────────────────────────────────────────────

/**
 * Get a driver profile by their users table ID.
 */
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

/**
 * Paginated list of verified drivers.
 * Useful for clients/owners browsing available drivers.
 */
export const getVerified = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    // Fetch all drivers, filter verified in handler
    // (Convex doesn't support compound filters in indexes yet)
    const result = await ctx.db.query("drivers").paginate(paginationOpts);

    return {
      ...result,
      page: result.page.filter((d) => d.verificationStatus === "verified"),
    };
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

/**
 * Create a driver profile for the currently authenticated user.
 * Called after the driver completes onboarding steps 1-8.
 */
export const createProfile = mutation({
  args: {
    licenseClass: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
        v.literal("C"),
        v.literal("D"),
        v.literal("E"),
        v.literal("F"),
      ),
    ),
    yearsExperience: v.optional(v.string()),
    employmentStatus: v.optional(v.string()),
    driverGoal: v.optional(v.string()),
    residentialAddress: v.optional(v.string()),
    hasCriminalRecord: v.optional(v.boolean()),
    criminalRecordDetails: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    licenseExpiryDate: v.optional(v.string()),
    vehicleTypes: v.array(v.string()),
    // Verification documents
    nationalIdFrontStorageId: v.optional(v.string()),
    nationalIdBackStorageId: v.optional(v.string()),
    licenseFrontStorageId: v.optional(v.string()),
    licenseBackStorageId: v.optional(v.string()),
    selfieStorageId: v.optional(v.string()),
    // OCR extracted data
    extractedFullName: v.optional(v.string()),
    extractedDateOfBirth: v.optional(v.string()),
    extractedNationalIdNumber: v.optional(v.string()),
    extractedAddress: v.optional(v.string()),
    extractedLicenseNumber: v.optional(v.string()),
    extractedLicenseClass: v.optional(v.string()),
    extractedLicenseExpiry: v.optional(v.string()),
    // Face verification
    faceMatchPassed: v.optional(v.boolean()),
    faceMatchConfidence: v.optional(v.float64()),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleYear: v.optional(v.string()),
    vehiclePlateNumber: v.optional(v.string()),
    vehicleOwnership: v.optional(v.string()),
    ownerConsentObtained: v.optional(v.boolean()),
    preferredJobType: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceExpiryDate: v.optional(v.string()),
    roadworthinessCertDate: v.optional(v.string()),
    hasRecentViolations: v.optional(v.boolean()),
    violationDetails: v.optional(v.string()),
    payoutMethod: v.optional(v.string()),
    payoutAccountName: v.optional(v.string()),
    payoutAccountNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Check if driver profile already exists
    const existing = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    const now = Date.now();
    return ctx.db.insert("drivers", {
      userId: user._id,
      licenseClass: args.licenseClass,
      yearsExperience: args.yearsExperience,
      employmentStatus: args.employmentStatus,
      driverGoal: args.driverGoal,
      residentialAddress: args.residentialAddress,
      hasCriminalRecord: args.hasCriminalRecord,
      criminalRecordDetails: args.criminalRecordDetails,
      licenseNumber: args.licenseNumber,
      licenseExpiryDate: args.licenseExpiryDate,
      vehicleTypes: args.vehicleTypes,
      nationalIdFrontStorageId: args.nationalIdFrontStorageId,
      nationalIdBackStorageId: args.nationalIdBackStorageId,
      licenseFrontStorageId: args.licenseFrontStorageId,
      licenseBackStorageId: args.licenseBackStorageId,
      selfieStorageId: args.selfieStorageId,
      extractedFullName: args.extractedFullName,
      extractedDateOfBirth: args.extractedDateOfBirth,
      extractedNationalIdNumber: args.extractedNationalIdNumber,
      extractedAddress: args.extractedAddress,
      extractedLicenseNumber: args.extractedLicenseNumber,
      extractedLicenseClass: args.extractedLicenseClass,
      extractedLicenseExpiry: args.extractedLicenseExpiry,
      faceMatchPassed: args.faceMatchPassed,
      faceMatchConfidence: args.faceMatchConfidence,
      vehicleMake: args.vehicleMake,
      vehicleModel: args.vehicleModel,
      vehicleYear: args.vehicleYear,
      vehiclePlateNumber: args.vehiclePlateNumber,
      vehicleOwnership: args.vehicleOwnership,
      ownerConsentObtained: args.ownerConsentObtained,
      preferredJobType: args.preferredJobType,
      preferredLocation: args.preferredLocation,
      insuranceProvider: args.insuranceProvider,
      insurancePolicyNumber: args.insurancePolicyNumber,
      insuranceExpiryDate: args.insuranceExpiryDate,
      roadworthinessCertDate: args.roadworthinessCertDate,
      hasRecentViolations: args.hasRecentViolations,
      violationDetails: args.violationDetails,
      payoutMethod: args.payoutMethod,
      payoutAccountName: args.payoutAccountName,
      payoutAccountNumber: args.payoutAccountNumber,
      verificationStatus: "pending",
      totalTrips: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update driver-specific profile fields.
 * Only the authenticated driver can update their own profile.
 */
export const updateProfile = mutation({
  args: {
    licenseClass: v.optional(
      v.union(
        v.literal("A"),
        v.literal("B"),
        v.literal("C"),
        v.literal("D"),
        v.literal("E"),
        v.literal("F"),
      ),
    ),
    yearsExperience: v.optional(v.string()),
    vehicleTypes: v.optional(v.array(v.string())),
    vehicleMake: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    vehicleYear: v.optional(v.string()),
    vehiclePlateNumber: v.optional(v.string()),
    vehicleOwnership: v.optional(v.string()),
    preferredJobType: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    insuranceProvider: v.optional(v.string()),
    insurancePolicyNumber: v.optional(v.string()),
    insuranceExpiryDate: v.optional(v.string()),
    payoutMethod: v.optional(v.string()),
    payoutAccountName: v.optional(v.string()),
    payoutAccountNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      throw new Error("Driver profile not found. Complete onboarding first.");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.licenseClass !== undefined)
      updates.licenseClass = args.licenseClass;
    if (args.yearsExperience !== undefined)
      updates.yearsExperience = args.yearsExperience;
    if (args.vehicleTypes !== undefined)
      updates.vehicleTypes = args.vehicleTypes;
    if (args.vehicleMake !== undefined) updates.vehicleMake = args.vehicleMake;
    if (args.vehicleModel !== undefined)
      updates.vehicleModel = args.vehicleModel;
    if (args.vehicleYear !== undefined) updates.vehicleYear = args.vehicleYear;
    if (args.vehiclePlateNumber !== undefined)
      updates.vehiclePlateNumber = args.vehiclePlateNumber;
    if (args.vehicleOwnership !== undefined)
      updates.vehicleOwnership = args.vehicleOwnership;
    if (args.preferredJobType !== undefined)
      updates.preferredJobType = args.preferredJobType;
    if (args.preferredLocation !== undefined)
      updates.preferredLocation = args.preferredLocation;
    if (args.insuranceProvider !== undefined)
      updates.insuranceProvider = args.insuranceProvider;
    if (args.insurancePolicyNumber !== undefined)
      updates.insurancePolicyNumber = args.insurancePolicyNumber;
    if (args.insuranceExpiryDate !== undefined)
      updates.insuranceExpiryDate = args.insuranceExpiryDate;
    if (args.payoutMethod !== undefined)
      updates.payoutMethod = args.payoutMethod;
    if (args.payoutAccountName !== undefined)
      updates.payoutAccountName = args.payoutAccountName;
    if (args.payoutAccountNumber !== undefined)
      updates.payoutAccountNumber = args.payoutAccountNumber;

    await ctx.db.patch(driver._id, updates);
  },
});

/**
 * Update a driver's verification status.
 * Will be called by MetaMap webhook action in the future.
 * For now, can be called by internal functions.
 */
export const updateVerificationStatus = mutation({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
  },
  handler: async (ctx, { status }) => {
    const user = await getCurrentUserOrThrow(ctx);
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      throw new Error("Driver profile not found.");
    }

    await ctx.db.patch(driver._id, {
      verificationStatus: status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Save identity verification documents and OCR results.
 * Called after the verification pipeline completes (capture + OCR + face match).
 */
export const saveVerificationDocuments = mutation({
  args: {
    nationalIdFrontStorageId: v.optional(v.string()),
    nationalIdBackStorageId: v.optional(v.string()),
    licenseFrontStorageId: v.optional(v.string()),
    licenseBackStorageId: v.optional(v.string()),
    selfieStorageId: v.optional(v.string()),
    extractedFullName: v.optional(v.string()),
    extractedDateOfBirth: v.optional(v.string()),
    extractedNationalIdNumber: v.optional(v.string()),
    extractedAddress: v.optional(v.string()),
    extractedLicenseNumber: v.optional(v.string()),
    extractedLicenseClass: v.optional(v.string()),
    extractedLicenseExpiry: v.optional(v.string()),
    faceMatchPassed: v.optional(v.boolean()),
    faceMatchConfidence: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!driver) {
      throw new Error("Driver profile not found. Complete onboarding first.");
    }

    await ctx.db.patch(driver._id, {
      ...args,
      verificationStatus: "submitted",
      updatedAt: Date.now(),
    });

    // Create verification records for each document type
    const now = Date.now();

    if (args.nationalIdFrontStorageId) {
      await ctx.db.insert("verifications", {
        userId: user._id,
        type: "national_id",
        provider: "internal_ocr",
        status: "submitted",
        frontStorageId: args.nationalIdFrontStorageId,
        backStorageId: args.nationalIdBackStorageId,
        submittedAt: now,
      });
    }

    if (args.licenseFrontStorageId) {
      await ctx.db.insert("verifications", {
        userId: user._id,
        type: "license",
        provider: "internal_ocr",
        status: "submitted",
        frontStorageId: args.licenseFrontStorageId,
        backStorageId: args.licenseBackStorageId,
        submittedAt: now,
      });
    }

    if (args.selfieStorageId) {
      await ctx.db.insert("verifications", {
        userId: user._id,
        type: "facial_match",
        provider: "internal_face_match",
        status: args.faceMatchPassed ? "verified" : "pending",
        selfieStorageId: args.selfieStorageId,
        faceMatchScore: args.faceMatchConfidence,
        submittedAt: now,
        completedAt: args.faceMatchPassed ? now : undefined,
      });
    }
  },
});
