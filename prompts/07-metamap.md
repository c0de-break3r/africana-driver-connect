Read AGENTS.md fully — Dojah credentials must never be exposed on the client.

Migrate Dojah verification from the native SDK to a server-side Convex Action with custom camera UI.

## Current State

- `lib/dojah.ts` uses Dojah REST API with `EXPO_PUBLIC_DOJAH_APP_ID` / `EXPO_PUBLIC_DOJAH_SECRET_KEY` — credentials should be on server side only
- `license-capture.tsx` has custom camera UI (ID capture → selfie → success) using `expo-camera`
- The camera UI is not connected to Dojah APIs or Convex

## Tasks

1. **Remove `dojah-js`** from `package.json` — we use the REST API directly via Convex Actions
2. **Update `lib/dojah.ts`** — keep only TypeScript types, remove any client-side API calls
3. **Create Convex Action** (`convex/dojah.ts`):
   - `createVerificationSession` — creates a verification session via Dojah API, stores `DOJAH_APP_ID` + `DOJAH_SECRET_KEY` as Convex env vars
   - `verifyDocument` — submits document for verification (Ghana Card, Driver's License, etc.)
   - `verifySelfie` — submits selfie for face verification
   - Store Dojah credentials as Convex environment variables: `DOJAH_APP_ID`, `DOJAH_SECRET_KEY`
4. **Create Convex HTTP endpoint** (`convex/http.ts`):
   - `handleDojahWebhook` — receives verification results from Dojah, updates `verifications` table and driver `verificationStatus`
5. **Update `license-capture.tsx`** — upload captured images to Convex storage, then call `verifyDocument` and `verifySelfie` actions
6. **Update verification status UI** — show real-time status from Convex `verifications` table (pending → submitted → verified/rejected)

## Dojah REST API Flow (per https://docs.dojah.io/overview/quickstart)

1. `POST https://api.dojah.io/api/v1/verification/kyc` → create verification session
2. `POST https://api.dojah.io/api/v1/verification/kyc/document` → submit document
3. `POST https://api.dojah.io/api/v1/verification/kyc/selfie` → submit selfie
4. Webhook → Convex HTTP endpoint → update verification status

## Rules

- No `EXPO_PUBLIC_DOJAH_*` env vars — all secrets on server side only
- No Dojah hosted UI — use the custom camera UI in `license-capture.tsx`
- All verification status changes go through Convex mutations
- Run `bun run typecheck` and `bun run lint` — fix all errors