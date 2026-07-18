# Back of Document Capture Screen - Implementation Plan

## Goal
Improve the "Back of Document" capture screen (step 3 of ID verification) with real camera feed, edge detection, auto-capture, Dojah integration, and proper error handling.

## Current State
- `kyc-document-scan.tsx` handles all 3 phases (front, scan_id, back) in a single file
- Back phase has: static camera frame, dashed-border placeholder, checklist, Capture/Upload buttons
- No real-time camera feedback or Dojah OCR integration
- Progress indicator uses inline circles at top

## Affected Files
- `src/app/(onboarding)/driver/kyc-document-scan.tsx` - Main screen (split into separate screens recommended)
- `convex/kyc.ts` - Dojah API integration (needs enhancement for back-of-card parsing)
- `convex/schema.ts` - Database schema (needs fields for extracted back-of-card data)
- `src/store/useKycFlowStore.ts` - Zustand store (needs state for processing/error)

## Implementation Tasks

### 1. Create Dojah API Action for Back-of-Card Parsing
**File:** `convex/kyc.ts`

Add new action/endpoint:
```typescript
export const submitBackOfCard = mutation({
  args: {
    documentBackUri: v.string(),
    documentType: v.union(v.literal("passport"), v.literal("drivers_license"), v.literal("national_id")),
  },
  handler: async (ctx, args) => {
    // Call Dojah document API
    // Parse response for back-of-card fields:
    // - issuing authority
    // - expiry date
    // - document number
    // - MRZ/barcode data
    // - backOfCardExtracted: boolean
  }
});
```

### 2. Update Convex Schema for Back-of-Card Data
**File:** `convex/schema.ts`

Add fields to `drivers` table:
- `backOfCardExtracted: v.optional(v.boolean())`
- `backOfCardExpiryDate: v.optional(v.string())`
- `backOfCardIssuingAuthority: v.optional(v.string())`
- `backOfCardExtractedData: v.optional(v.string())` // JSON

Add field to `verifications` table:
- `backOfCardParsed: v.optional(v.boolean())`

### 3. Update Zustand Store
**File:** `src/store/useKycFlowStore.ts`

Add state:
- `backOfCardProcessing: boolean`
- `backOfCardError: string | null`
- `backOfCardData: {...} | null`

Add actions:
- `setBackOfCardProcessing(processing: boolean)`
- `setBackOfCardError(error: string | null)`
- `setBackOfCardData(data: BackOfCardData | null)`

### 4. Create Camera Hook for Edge Detection
**New File:** `src/hooks/useDocumentEdgeDetection.ts`

Features:
- Use expo-vision-camera or expo-gl for edge detection
- Detect document boundaries in real-time
- Return: `isDocumentDetected`, `documentRect`, `qualityMetrics`

### 5. Update kyc-document-scan.tsx - Back Phase
**File:** `src/app/(onboarding)/driver/kyc-document-scan.tsx`

#### UI Changes:
- Replace dashed-border placeholder with live camera overlay frame
- Add colored border overlay (green/orange) that appears when document is detected
- Add real-time feedback text under frame:
  - "Move closer" (when too far)
  - "Reduce glare" (when glare detected)
  - "Hold steady" (when stable)
  - "Document detected" (when ready for auto-capture)

#### Behavior Changes:
- Add auto-capture timer (1 second when document is flat/in-frame/focused)
- Add processing overlay after capture (spinner)
- Add inline error display with retake button
- Keep manual capture as fallback

#### Camera Implementation:
```tsx
<CameraView style={styles.camera} facing="back">
  {edgeDetectionOverlay}
</CameraView>
```

### 6. Create Processing Overlay Component
**New File:** `src/components/ProcessingOverlay.tsx`

Props:
- `visible: boolean`
- `message: string`
- `onFinish?: () => void`

Shows spinner with status message over captured image.

### 7. Create Inline Error Component
**New File:** `src/components/InlineError.tsx`

Props:
- `message: string`
- `onRetake: () => void`

Shows error banner with retry option.

### 8. Update Progress Indicator
**File:** `src/components/driver-step-shell.tsx` or create new component

The current implementation uses PageDots. The KYC screens use inline circles:
```
[1] Choose ID → [2] Scan ID → [3] Selfie
```

Keep this format but ensure step 2 shows completion when back is captured.

## Flow Diagram

```
Back of Document Screen
┌─────────────────────────────────────┐
│  Full-screen camera feed            │
│  ┌───────────────────────────────┐  │
│  │  Document frame overlay        │  │
│  │  [Green border when detected]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Feedback: "Document detected"      │
│  [● Capture]  [Upload]              │
│                                     │
│  Progress: [1] → [2] ✓ → [3]        │
└─────────────────────────────────────┘

On Auto-Capture:
┌─────────────────────────────────────┐
│  Processing overlay                 │
│  [Spinner] "Verifying document..."  │
│                                     │
└─────────────────────────────────────┘

On Success:
→ Proceed to Selfie capture

On Failure:
┌─────────────────────────────────────┐
│  [Error icon] "Could not read      │
│   document. Please retake."        │
│  [Retake]                           │
└─────────────────────────────────────┘
```

## Dojah API Integration Details

### Document Submission Endpoint
- URL: `POST https://api.dojah.io/v1/verification/document`
- Headers: `Authorization: Basic ${base64(app_id:secret_key)}`
- Body:
```json
{
  "document_type": "national_id",
  "document_front": "<front_uri>",
  "document_back": "<back_uri>"
}
```

### Expected Response Fields (back-of-card)
```json
{
  "data": {
    "issuing_authority": "Ghana Immigration Service",
    "expiry_date": "2030-12-31",
    "document_number": "GH12345678",
    "mrz_data": "...",
    "barcode_data": "..."
  }
}
```

## Error Handling

1. **Camera Permission Denied**: Show alert with settings link
2. **Dojah API Timeout**: Show "Verification taking longer" with retry option
3. **Parse Failure (blurry/unsupported)**: Show specific error with retake
4. **Network Error**: Show "Connection failed, please try again"
5. **Mismatch (front vs back data)**: Flag for manual review

## Data Privacy (Ghana Data Protection Commission Act 843)

1. **Consent**: Show consent notice before capture
2. **Data Retention**: Delete raw images after successful parsing
3. **Encryption**: Store extracted data encrypted at rest
4. **Audit Log**: Log all access to verification data

## Testing Considerations

1. Test with actual Ghana Card images
2. Test edge cases (poor lighting, glare, tilted card)
3. Test Dojah mock responses
4. Test offline/retry scenarios
5. Test permission denial flows

## Rollout Strategy

1. Deploy new screen to 10% of users (feature flag)
2. Monitor capture success rate
3. Monitor Dojah parse success rate
4. Gradually increase rollout
5. Full rollout after validation

## Open Questions

1. **Edge Detection Library**: Should we use `expo-vision-camera` or OpenCV?
   - Recommendation: Start with simple frame-based detection, add ML model later
   - Alternative: Use expo-gl with custom shader for edge detection

2. **Dojah Response Parsing**: How to handle different document types?
   - Need to check Dojah documentation for Ghana-specific fields

3. **Fallback to Manual Review**: What triggers manual review?
   - Low confidence score (<80%)
   - Missing required fields
   - Dojah API error