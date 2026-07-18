// ─── Dojah Integration ──────────────────────────────────────────────────────
// Placeholder for Dojah REST API integration via Convex Actions.
// Will be implemented when the custom verification flow connects to Dojah.
//
// Dojah credentials (DOJAH_APP_ID, DOJAH_SECRET_KEY) will be
// stored as Convex environment variables — never exposed to the client.
//
// Planned actions:
// - createVerificationSession: Create a verification session via Dojah API
// - verifyDocument: Submit document for verification (Ghana Card, Driver's License, etc.)
// - verifySelfie: Submit selfie for face verification
// - handleWebhook: HTTP endpoint that receives Dojah verification results
//   and updates the verifications table + driver verificationStatus
//
// Dojah REST API flow (per https://docs.dojah.io/overview/quickstart):
// 1. POST https://api.dojah.io/api/v1/verification/kyc → create verification session
// 2. POST https://api.dojah.io/api/v1/verification/kyc/document → submit document
// 3. POST https://api.dojah.io/api/v1/verification/kyc/selfie → submit selfie
// 4. Webhook → Convex HTTP endpoint → update verification status
//
// Reference: https://docs.dojah.io/overview/quickstart

/**
 * Dojah API base URL
 */
export const DOJAH_BASE_URL = "https://api.dojah.io";

/**
 * Dojah verification statuses mapped to our internal statuses
 */
export const DOJAH_STATUS_MAP = {
  pending: "pending_review",
  verified: "verified",
  rejected: "rejected",
  failed: "rejected",
} as const;
