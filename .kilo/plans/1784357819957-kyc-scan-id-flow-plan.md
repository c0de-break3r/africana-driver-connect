# Simplify KYC Document Scan Flow

## Goal
When users grant permission, automatically transition to Scan ID phase with camera already open, showing capture button and upload option.

## Current State
- Front screen: Shows "Request permission" button if not granted, or camera + buttons if granted
- After capture: Goes to "review_front" screen
- Back button from review_front goes to front screen

## Proposed Changes

### 1. Add Permission Check on Front Screen
- When `cameraPermissionGranted` is true, immediately transition to "scan_id" phase
- Remove the need for user to tap any button after granting permission

### 2. Rename "review_front" to "scan_id" Phase
- After capturing front, go to "scan_id" phase (not "review_front")
- "scan_id" shows:
  - Progress indicator (Step 1 complete)
  - Camera overlay with frame
  - "Capture" button
  - "Upload from photo library" text/button

### 3. Update Navigation
- Back button from "scan_id" → front screen
- Back button from "back" → front screen
- Front screen → back button → router.back()

### 4. Progress Indicator
- Step 1 "Choose ID": checkmark when `documentFrontUri` is set
- Step 2 "Scan ID": checkmark when `documentBackUri` is set
- Step 3 "Selfie": always active

## Implementation Tasks

### Task 1: Update Phase Transition Logic
- [ ] Change `setPhase("review_front")` to `setPhase("scan_id")` in `handleCapture`
- [ ] Add useEffect to transition to "scan_id" when permission is granted
- [ ] Update phase type: `"front" | "scan_id" | "back"`

### Task 2: Create "scan_id" Screen Component
- [ ] Rename "review_front" screen to "scan_id"
- [ ] Update title to "Scan ID"
- [ ] Update button text from "Continue" to "Capture"
- [ ] Add "Upload from photo library" text below capture button

### Task 3: Update Progress Indicator
- [ ] Ensure Step 1 shows checkmark when `documentFrontUri` is set
- [ ] Ensure Step 2 shows checkmark when `documentBackUri` is set

### Task 4: Handle Back Navigation
- [ ] Update back button from "scan_id" to go to front screen
- [ ] Update handleRetake to handle "scan_id" phase

## Files to Modify
- `src/app/(onboarding)/driver/kyc-document-scan.tsx`

## Validation
- [ ] Type check passes
- [ ] Lint passes
- [ ] Manual testing: permission flow works correctly