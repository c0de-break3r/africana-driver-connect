Read AGENTS.md fully — MetaMap credentials must never be exposed on the client.

Migrate MetaMap verification from the native SDK to a server-side Convex Action with custom camera UI.

## Current State

- `lib/metamap.ts` uses `react-native-metamap-sdk` with `EXPO_PUBLIC_METAMAP_CLIENT_ID` — credentials exposed in JS bundle
- `license-verify.tsx` has a 3-phase custom camera UI (ID capture → selfie → success) using `expo-camera`
- The camera UI is not connected to MetaMap APIs or Convex

## Tasks

1. **Remove `react-native-metamap-sdk`** from `package.json` — we use the REST API instead
2. **Delete `lib/metamap.ts`** — the SDK wrapper is no longer needed
3. **Create Convex Action** (`convex/metamap.ts`):
   - `submitVerification` — accepts image storage IDs, authenticates with MetaMap via `METAMAP_CLIENT_ID` + `METAMAP_CLIENT_SECRET` (Convex env vars, NOT `EXPO_PUBLIC_*`), uploads documents via multipart form, creates verification record in `verifications` table
   - Store MetaMap credentials as Convex environment variables: `METAMAP_CLIENT_ID`, `METAMAP_CLIENT_SECRET`, `METAMAP_FLOW_ID`
4. **Create Convex HTTP endpoint** (`convex/http.ts`):
   - `handleMetaMapWebhook` — receives verification results from MetaMap, updates `verifications` table and driver `verificationStatus`
5. **Update `license-verify.tsx`** — upload captured images to Convex storage, then call `submitVerification` action
6. **Update verification status UI** — show real-time status from Convex `verifications` table (pending → submitted → verified/rejected)

## MetaMap REST API Flow

1. `POST https://api.prod.metamap.com/oauth` (Basic auth) → JWT token
2. `POST https://api.prod.metamap.com/v2/verifications` → identity ID
3. `POST https://api.prod.metamap.com/v2/verifications/{id}/documents` → upload images

## Rules

- No `EXPO_PUBLIC_METAMAP_*` env vars — all secrets on server side only
- No MetaMap hosted UI — use the custom camera UI in `license-verify.tsx`
- All verification status changes go through Convex mutations
- Run `bun run typecheck` and `bun run lint` — fix all errors
