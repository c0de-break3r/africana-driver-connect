// ─── MetaMap Integration ──────────────────────────────────────────────────
// Placeholder for MetaMap REST API integration via Convex Actions.
// Will be implemented when the custom verification flow connects to MetaMap.
//
// MetaMap credentials (METAMAP_CLIENT_ID, METAMAP_CLIENT_SECRET) will be
// stored as Convex environment variables — never exposed to the client.
//
// Planned actions:
// - submitVerification: Authenticate with MetaMap, create verification,
//   upload document images + selfie via multipart form data
// - handleWebhook: HTTP endpoint that receives MetaMap verification results
//   and updates the verifications table + driver verificationStatus
//
// MetaMap REST API flow:
// 1. POST https://api.prod.metamap.com/oauth (Basic auth) → JWT token
// 2. POST https://api.prod.metamap.com/v2/verifications → identity ID
// 3. POST https://api.getmati.com/v2/identities/{id}/send-input → documents
// 4. Webhook → Convex HTTP endpoint → update verification status
//
// Reference: https://docs.metamap.com/docs/rest-api
