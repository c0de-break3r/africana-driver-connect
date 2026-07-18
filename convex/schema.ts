import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Africana Driver Connect — Convex Database Schema
 *
 * This schema defines all tables for the transport marketplace:
 * - users: Clerk-synced user profiles with role
 * - drivers: Driver-specific profiles and verification
 * - owners: Vehicle owner profiles
 * - vehicles: Registered vehicles
 * - jobs: Posted driving jobs
 * - jobApplications: Driver applications to jobs
 * - bookings: Transport bookings (client ↔ driver)
 * - ratings: Reviews between users
 * - notifications: In-app notifications
 * - verifications: Document/identity verification records
 */
export default defineSchema({
  // ─── Users ──────────────────────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("driver"),
        v.literal("owner"),
        v.literal("client"),
        v.literal("corporate"),
      ),
    ),
    location: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  // ─── Drivers ────────────────────────────────────────────────────────────
  drivers: defineTable({
    userId: v.id("users"),
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
    // Identity verification documents (storage references)
    nationalIdFrontStorageId: v.optional(v.string()),
    nationalIdBackStorageId: v.optional(v.string()),
    licenseFrontStorageId: v.optional(v.string()),
    licenseBackStorageId: v.optional(v.string()),
    selfieStorageId: v.optional(v.string()),
    // OCR-extracted data from documents
    extractedFullName: v.optional(v.string()),
    extractedDateOfBirth: v.optional(v.string()),
    extractedNationalIdNumber: v.optional(v.string()),
    extractedAddress: v.optional(v.string()),
    extractedLicenseNumber: v.optional(v.string()),
    extractedLicenseClass: v.optional(v.string()),
    extractedLicenseExpiry: v.optional(v.string()),
    // Face verification result
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
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("pending_review"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    kycStatus: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("pending_review"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    rating: v.optional(v.float64()),
    totalTrips: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── Owners ─────────────────────────────────────────────────────────────
  owners: defineTable({
    userId: v.id("users"),
    companyName: v.optional(v.string()),
    vehicleCount: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── Vehicles ───────────────────────────────────────────────────────────
  vehicles: defineTable({
    ownerId: v.id("users"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    type: v.string(),
    plateNumber: v.string(),
    registrationStatus: v.union(
      v.literal("pending"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
    ),
    documents: v.array(
      v.object({
        type: v.string(),
        storageId: v.id("_storage"),
        uploadedAt: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  // ─── Jobs ───────────────────────────────────────────────────────────────
  jobs: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    location: v.string(),
    payMin: v.optional(v.number()),
    payMax: v.optional(v.number()),
    payCurrency: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("filled"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  // ─── Job Applications ──────────────────────────────────────────────────
  jobApplications: defineTable({
    jobId: v.id("jobs"),
    driverId: v.id("users"),
    coverNote: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
    appliedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_job", ["jobId"])
    .index("by_driver", ["driverId"]),

  // ─── Bookings ───────────────────────────────────────────────────────────
  bookings: defineTable({
    clientId: v.id("users"),
    driverId: v.id("users"),
    vehicleId: v.optional(v.id("vehicles")),
    occasionType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed"),
    ),
    scheduledAt: v.number(),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_driver", ["driverId"]),

  // ─── Ratings ────────────────────────────────────────────────────────────
  ratings: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    bookingId: v.optional(v.id("bookings")),
    score: v.number(),
    comment: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_to_user", ["toUserId"])
    .index("by_from_user", ["fromUserId"]),

  // ─── Notifications ─────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── Verifications ─────────────────────────────────────────────────────
  verifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("national_id"),
      v.literal("license"),
      v.literal("identity"),
      v.literal("vehicle"),
      v.literal("police_clearance"),
      v.literal("facial_match"),
    ),
    provider: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("submitted"),
      v.literal("pending_review"),
      v.literal("verified"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    providerId: v.optional(v.string()),
    // Document storage references
    frontStorageId: v.optional(v.string()),
    backStorageId: v.optional(v.string()),
    selfieStorageId: v.optional(v.string()),
    // OCR results
    extractedData: v.optional(v.string()), // JSON string of extracted fields
    // Face match
    faceMatchScore: v.optional(v.float64()),
    submittedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_provider_id", ["providerId"]),
});
