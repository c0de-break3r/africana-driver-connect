import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { PrimaryButton, ScreenContainer } from "@/components/ui";
import {
    useDriverOnboardingStore,
    type ExtractedIdData,
    type ExtractedLicenseData,
} from "@/store/useDriverOnboardingStore";

// Safely load expo-camera
let CameraView: React.ComponentType<any> | null = null;
let useCameraPermissions:
  (() => [{ granted: boolean } | null, () => void]) | null = null;
try {
  const cam = require("expo-camera");
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
} catch {
  // Native module not available
}

type Phase = "instructions" | "capture" | "preview" | "processing" | "result";

/**
 * Step 5 — Facial Verification
 *
 * Captures a selfie using the front camera. The selfie is compared against
 * the photo on the scanned National ID to confirm identity.
 *
 * Flow:
 * 1. Instructions — explain what facial verification does
 * 2. Capture — front camera with face guide circle
 * 3. Preview — review the selfie
 * 4. Processing — run face matching (backend action)
 * 5. Result — show pass/fail with confidence score
 */
export default function FacialVerifyScreen() {
  const {
    selfieUri,
    setSelfieCapture,
    setFaceMatchResult,
    setStep,
    setVerificationPipelineStatus,
  } = useDriverOnboardingStore();

  /* ── Camera not available ── */
  if (!CameraView || !useCameraPermissions) {
    return (
      <DriverStepShell
        stepIndex={5}
        title="Facial verification"
        description="Take a quick selfie to confirm your identity matches your documents."
        buttonTitle="Skip & Continue"
        onContinue={() => {
          setStep(5);
          router.push("/(onboarding)/driver/verification-review" as Href);
        }}
      >
        <View style={styles.fallback}>
          <Ionicons name="person-circle-outline" size={64} color="#6E7E91" />
          <Text style={styles.fallbackText}>
            Camera access requires a development build with expo-camera
            installed. You can skip this step and verify later.
          </Text>
        </View>
      </DriverStepShell>
    );
  }

  return (
    <CameraFacialCapture
      CameraViewComponent={CameraView}
      useCameraPermissionsHook={useCameraPermissions}
      selfieUri={selfieUri}
      setSelfieCapture={setSelfieCapture}
      setFaceMatchResult={setFaceMatchResult}
      setStep={setStep}
      setVerificationPipelineStatus={setVerificationPipelineStatus}
    />
  );
}

function CameraFacialCapture({
  CameraViewComponent,
  useCameraPermissionsHook,
  selfieUri,
  setSelfieCapture,
  setFaceMatchResult,
  setStep,
  setVerificationPipelineStatus,
}: {
  CameraViewComponent: React.ComponentType<any>;
  useCameraPermissionsHook: () => [{ granted: boolean } | null, () => void];
  selfieUri: string;
  setSelfieCapture: (uri: string) => void;
  setFaceMatchResult: (passed: boolean, confidence: number) => void;
  setStep: (step: number) => void;
  setVerificationPipelineStatus: (
    status:
      | "not_started"
      | "capturing"
      | "processing"
      | "review"
      | "confirmed"
      | "failed",
  ) => void;
}) {
  const [permission, requestPermission] = useCameraPermissionsHook();
  const [phase, setPhase] = useState<Phase>(() =>
    selfieUri ? "preview" : "instructions",
  );
  const [capturing, setCapturing] = useState(false);
  const [uri, setUri] = useState(selfieUri);
  const [faceMatchPassed, setFaceMatchPassed] = useState<boolean | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C3E5B" />
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Ionicons
            name="camera-outline"
            size={56}
            color="#6E7E91"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionBody}>
            We need your camera for a quick selfie to verify your identity
            matches your documents.
          </Text>
          <View style={{ width: "100%", marginTop: 24 }}>
            <PrimaryButton
              title="Grant Camera Access"
              onPress={requestPermission}
              style={{ width: "100%" }}
            />
          </View>
          <Pressable
            style={styles.skipLink}
            onPress={() => {
              setStep(5);
              router.push("/(onboarding)/driver/verification-review" as Href);
            }}
          >
            <Text style={styles.skipLinkText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
      if (photo) {
        setUri(photo.uri);
        setPhase("preview");
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUri("");
    setPhase("capture");
  };

  const handleVerify = async () => {
    if (!uri) return;
    setSelfieCapture(uri);
    setPhase("processing");
    setVerificationPipelineStatus("processing");

    // In production: call the Convex action to run face matching
    // For now, simulate a successful match
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock result — in production, this comes from the backend action
      const mockPassed = true;
      const mockConfidence = 95.5;

      setFaceMatchResult(mockPassed, mockConfidence);
      setFaceMatchPassed(mockPassed);
      setConfidence(mockConfidence);
      setPhase("result");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase("preview");
    }
  };

  const handleContinue = () => {
    // Trigger mock OCR processing before navigating to review
    // In production this would call the Convex verification action
    const store = useDriverOnboardingStore.getState();
    if (!store.extractedIdData && !store.extractedLicenseData) {
      // Populate with mock OCR-extracted data so the review screen
      // can display and let users edit the auto-filled fields
      const mockIdData: ExtractedIdData = {
        fullName: "Kwame Asante",
        dateOfBirth: "15/03/1990",
        nationalIdNumber: "GHA-1234567890",
        address: "12 Independence Ave, Accra",
      };
      const mockLicenseData: ExtractedLicenseData = {
        fullName: "Kwame Asante",
        dateOfBirth: "15/03/1990",
        licenseNumber: "DVLA-ACC-987654",
        licenseClass: "B",
        expiryDate: "31/12/2027",
      };
      store.setExtractedData(mockIdData, mockLicenseData);
    }

    setVerificationPipelineStatus("review");
    setStep(5);
    router.push("/(onboarding)/driver/verification-review" as Href);
  };

  /* ── Instructions phase ── */
  if (phase === "instructions") {
    return (
      <DriverStepShell
        stepIndex={5}
        title="Facial verification"
        description="We'll compare your selfie with your ID photo to confirm your identity."
        buttonTitle="Start Selfie"
        onContinue={() => setPhase("capture")}
      >
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionRow}>
            <View style={styles.instructionIcon}>
              <Ionicons name="eye" size={24} color="#2C3E5B" />
            </View>
            <View style={styles.instructionText}>
              <Text style={styles.instructionTitle}>Good lighting</Text>
              <Text style={styles.instructionDesc}>
                Face a window or light source
              </Text>
            </View>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.instructionIcon}>
              <Ionicons name="person" size={24} color="#2C3E5B" />
            </View>
            <View style={styles.instructionText}>
              <Text style={styles.instructionTitle}>Remove accessories</Text>
              <Text style={styles.instructionDesc}>
                Take off sunglasses, hats, or masks
              </Text>
            </View>
          </View>
          <View style={styles.instructionRow}>
            <View style={styles.instructionIcon}>
              <Ionicons name="scan" size={24} color="#2C3E5B" />
            </View>
            <View style={styles.instructionText}>
              <Text style={styles.instructionTitle}>Center your face</Text>
              <Text style={styles.instructionDesc}>
                Keep your face inside the circle guide
              </Text>
            </View>
          </View>
        </View>
      </DriverStepShell>
    );
  }

  /* ── Processing phase ── */
  if (phase === "processing") {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C3E5B" />
          <Text style={styles.processingTitle}>Verifying your identity</Text>
          <Text style={styles.processingDesc}>
            Comparing your selfie with your ID photo...
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  /* ── Result phase ── */
  if (phase === "result") {
    const passed = faceMatchPassed === true;
    return (
      <DriverStepShell
        stepIndex={5}
        title={passed ? "Identity verified!" : "Verification needs review"}
        description={
          passed
            ? `Face match confidence: ${confidence?.toFixed(1)}%. Your identity matches your documents.`
            : "We couldn't confirm a match. You can retake or continue — our team will review manually."
        }
        buttonTitle="Continue"
        onContinue={handleContinue}
        onBack={handleRetake}
      >
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor: passed
                  ? "rgba(46, 204, 113, 0.1)"
                  : "rgba(255, 193, 7, 0.1)",
              },
            ]}
          >
            <Ionicons
              name={passed ? "checkmark-circle" : "alert-circle"}
              size={48}
              color={passed ? "#2ECC71" : "#FFC107"}
            />
          </View>
          {uri ? <Image source={{ uri }} style={styles.resultSelfie} /> : null}
          {!passed && (
            <Pressable style={styles.retakeBtn} onPress={handleRetake}>
              <Ionicons name="camera" size={16} color="#2C3E5B" />
              <Text style={styles.retakeBtnText}>Retake selfie</Text>
            </Pressable>
          )}
        </View>
      </DriverStepShell>
    );
  }

  /* ── Preview phase ── */
  if (phase === "preview" && uri) {
    return (
      <DriverStepShell
        stepIndex={5}
        title="Review your selfie"
        description="Make sure your face is clearly visible and well-lit."
        buttonTitle="Verify My Identity"
        onContinue={handleVerify}
        onBack={handleRetake}
      >
        <View style={styles.previewContainer}>
          <Image source={{ uri }} style={styles.previewSelfie} />
          <Pressable style={styles.retakeBtn} onPress={handleRetake}>
            <Ionicons name="camera" size={16} color="#2C3E5B" />
            <Text style={styles.retakeBtnText}>Retake selfie</Text>
          </Pressable>
        </View>
      </DriverStepShell>
    );
  }

  /* ── Camera capture phase ── */
  return (
    <View style={styles.fullScreen}>
      <CameraViewComponent
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        flash="off"
      />

      <View style={styles.overlay}>
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Take a Selfie</Text>
              <Text style={styles.headerSubtitle}>Face Verification</Text>
            </View>
            <View style={styles.progressRing}>
              <View
                style={[styles.progressDot, { backgroundColor: "#FF7B54" }]}
              />
            </View>
          </View>
        </View>

        <View style={styles.viewfinderWrap}>
          <View style={styles.selfieCircleWrap}>
            <View style={styles.selfieCircle} />
            <Text style={styles.selfieHint}>
              Position your face within the circle
            </Text>
          </View>
        </View>

        <View style={styles.bottomControls}>
          <Pressable
            style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={capturing}
          >
            <Text style={styles.captureBtnText}>
              {capturing ? "Capturing..." : "Capture Selfie"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.skipBottomLink}
            onPress={() => {
              setStep(5);
              router.push("/(onboarding)/driver/verification-review" as Href);
            }}
          >
            <Text style={styles.skipBottomText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: "#FFF8F3",
  },
  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  fallbackText: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  /* Overlay */
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#2C3E5B" },
  headerSubtitle: { fontSize: 14, color: "#6E7E91", marginTop: 2 },
  progressRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#E8ECF0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressDot: { width: 12, height: 12, borderRadius: 6 },

  /* Selfie guide */
  viewfinderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selfieCircleWrap: { alignItems: "center", justifyContent: "center" },
  selfieCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  selfieHint: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 16,
  },

  /* Bottom controls */
  bottomControls: { alignItems: "center", gap: 12 },
  captureBtn: {
    backgroundColor: "rgba(255, 123, 84, 0.9)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  skipBottomLink: { paddingVertical: 8 },
  skipBottomText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },

  /* Instructions */
  instructionsContainer: { width: "100%", gap: 20, marginTop: 8 },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  instructionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(44, 62, 91, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionText: { flex: 1 },
  instructionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 2,
  },
  instructionDesc: { fontSize: 13, color: "#6E7E91" },

  /* Preview */
  previewContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  previewSelfie: {
    width: 220,
    height: 220,
    borderRadius: 110,
    resizeMode: "cover",
  },

  /* Result */
  resultContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
    marginTop: 8,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  resultSelfie: {
    width: 160,
    height: 160,
    borderRadius: 80,
    resizeMode: "cover",
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  retakeBtnText: { fontSize: 14, fontWeight: "500", color: "#2C3E5B" },

  /* Processing */
  processingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginTop: 24,
  },
  processingDesc: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  /* Permission */
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  permissionBody: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  skipLink: { paddingVertical: 12, marginTop: 8 },
  skipLinkText: { color: "#6E7E91", fontSize: 14, fontWeight: "500" },
});
