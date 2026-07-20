# Identity Verification Flow Implementation

## Context
Current state:
- `kyc-intro.tsx` shows intro screen with "Start verification" button → now navigates to camera-permission
- Navigation configured with `slide_from_right` animations in `_layout.tsx` files
- `useKycFlowStore` stores document URIs and selfie URI
- `convex/kyc.ts` has `submitKycDocuments`, `submitSelfie`, `generateUploadUrl`, `processBackOfCard` mutations

## Status: Implementation Complete

### 1. Camera Permission Flow (camera-permission.tsx) ✅
- Uses `expo-camera`'s `useCameraPermissions` hook
- Shows permission denied explainer with "Open Settings" button via `Linking.openSettings()`
- On granted: navigates to `/(onboarding)/driver/scan-id`

### 2. Scan ID Screen (scan-id.tsx) ✅
- Full-screen camera view via `CameraView` (expo-camera v57)
- Rounded-rectangle overlay (280x180) matching ID card aspect ratio
- Capture button at bottom with preview state
- Two-step flow for driver's license (front then back)
- Passport/national ID: single capture then navigate to selfie
- Stores captured URI in Zustand store via `setDocumentCapture`

### 3. Take Selfie Screen (take-selfie.tsx) ✅
- Camera with front-facing camera (`facing="front"`)
- Circular face-guide overlay (240x240)
- Single capture with "Retake" / "Use Photo" confirmation
- Stores selfie URI in Zustand store

### 4. Get Verified Screen (get-verified.tsx) ✅
- Three states: processing / success / failed
- Processing: spinner + "usually instant" copy
- Success: checkmark + navigate to driver dashboard
- Failed: navigate to manual review fallback
- Status persisted in Zustand via `setStatus`

### 5. Shared Element Transitions
**SKIPPED** - Per AGENTS.md build stability requirements. Reanimated 3 was removed due to EAS build incompatibility with Expo SDK 57.

## Files Created
- `src/app/(onboarding)/driver/camera-permission.tsx`
- `src/app/(onboarding)/driver/scan-id.tsx`
- `src/app/(onboarding)/driver/take-selfie.tsx`
- `src/app/(onboarding)/driver/get-verified.tsx`

## Files Modified
- `src/app/(onboarding)/driver/kyc-intro.tsx` - updated "Start verification" navigation to camera-permission
- `convex/kyc.ts` - added `generateUploadUrl` mutation, updated APIs to use storage IDs

## Validation
- `npx tsc --noEmit` passes ✅
- `npm run lint` passes ✅
- Uses Expo Router's built-in `slide_from_right` animations (configured in `_layout.tsx`)