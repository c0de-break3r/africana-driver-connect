import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { PrimaryButton, ScreenContainer } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

// Safely load expo-camera — native module may be absent in dev builds.
let CameraView: React.ComponentType<any> | null = null;
let useCameraPermissions:
  (() => [{ granted: boolean } | null, () => void]) | null = null;
try {
  const cam = require("expo-camera");
  CameraView = cam.CameraView;
  useCameraPermissions = cam.useCameraPermissions;
} catch {
  // Native module not available — camera features disabled.
}

type CapturePhase = "front" | "back" | "preview" | "validating";

/**
 * Step 3 — National ID Capture
 *
 * Captures front and back of the Ghana National ID (Ghana Card).
 * Uses the camera with a document viewfinder and green corner brackets.
 * After both sides are captured, shows a preview before proceeding.
 */
export default function IdCaptureScreen() {
  const {
    nationalIdFrontUri,
    nationalIdBackUri,
    setDocumentCapture,
    setStep,
    setVerificationPipelineStatus,
    setNationalIdValidated,
  } = useDriverOnboardingStore();

  /* ── Camera module not available ── */
  if (!CameraView || !useCameraPermissions) {
    return (
      <DriverStepShell
        stepIndex={2}
        title="Scan your Ghana Card"
        description="We need the front and back of your National ID to verify your identity."
        buttonTitle="Skip & Continue"
        onContinue={() => {
          setStep(3);
          router.push("/(onboarding)/driver/license-capture" as Href);
        }}
      >
        <View style={styles.fallback}>
          <Ionicons name="card-outline" size={56} color="#6E7E91" />
          <Text style={styles.fallbackText}>
            Camera access requires a development build with expo-camera
            installed. You can skip this step and verify later.
          </Text>
        </View>
      </DriverStepShell>
    );
  }

  return (
    <CameraIdCapture
      CameraViewComponent={CameraView}
      useCameraPermissionsHook={useCameraPermissions}
      nationalIdFrontUri={nationalIdFrontUri}
      nationalIdBackUri={nationalIdBackUri}
      setDocumentCapture={setDocumentCapture}
      setStep={setStep}
      setVerificationPipelineStatus={setVerificationPipelineStatus}
      setNationalIdValidated={setNationalIdValidated}
    />
  );
}

function CameraIdCapture({
  CameraViewComponent,
  useCameraPermissionsHook,
  nationalIdFrontUri,
  nationalIdBackUri,
  setDocumentCapture,
  setStep,
  setVerificationPipelineStatus,
  setNationalIdValidated,
}: {
  CameraViewComponent: React.ComponentType<any>;
  useCameraPermissionsHook: () => [{ granted: boolean } | null, () => void];
  nationalIdFrontUri: string;
  nationalIdBackUri: string;
  setDocumentCapture: (
    front: string,
    back: string,
    licFront: string,
    licBack: string,
  ) => void;
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
  setNationalIdValidated: (validated: boolean | null) => void;
}) {
  const [permission, requestPermission] = useCameraPermissionsHook();
  const [phase, setPhase] = useState<CapturePhase>(() =>
    nationalIdFrontUri ? (nationalIdBackUri ? "preview" : "back") : "front",
  );
  const [capturing, setCapturing] = useState(false);
  const [frontUri, setFrontUri] = useState(nationalIdFrontUri);
  const [backUri, setBackUri] = useState(nationalIdBackUri);
  const [showWrongDocModal, setShowWrongDocModal] = useState(false);
  const cameraRef = useRef<any>(null);

  /* ── Permission loading ── */
  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C3E5B" />
        </View>
      </ScreenContainer>
    );
  }

  /* ── Permission denied ── */
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
            We need your camera to scan your National ID for identity
            verification.
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
              setStep(3);
              router.push("/(onboarding)/driver/license-capture" as Href);
            }}
          >
            <Text style={styles.skipLinkText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  /* ── Capture handlers ── */
  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (photo) {
        if (phase === "front") {
          setFrontUri(photo.uri);
          setPhase("back");
        } else if (phase === "back") {
          setBackUri(photo.uri);
          setPhase("preview");
        }
      }
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === "preview") {
      setBackUri("");
      setPhase("back");
    } else if (phase === "back") {
      setFrontUri("");
      setPhase("front");
    }
  };

  const handleContinue = async () => {
    if (!frontUri || !backUri) return;

    // Run mock document type validation
    setPhase("validating");
    try {
      // Simulate validation delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock: 85% chance the document is valid (correct type)
      // In production: call a backend action that uses OCR/document classification
      const isValid = Math.random() > 0.15;

      if (!isValid) {
        setNationalIdValidated(false);
        setShowWrongDocModal(true);
        setPhase("preview");
        return;
      }

      // Valid document — proceed
      setNationalIdValidated(true);
      const { licenseFrontUri, licenseBackUri } =
        useDriverOnboardingStore.getState();
      setDocumentCapture(frontUri, backUri, licenseFrontUri, licenseBackUri);
      setVerificationPipelineStatus("capturing");
      setStep(3);
      router.push("/(onboarding)/driver/license-capture" as Href);
    } catch {
      // On error, proceed anyway
      const { licenseFrontUri, licenseBackUri } =
        useDriverOnboardingStore.getState();
      setDocumentCapture(frontUri, backUri, licenseFrontUri, licenseBackUri);
      setVerificationPipelineStatus("capturing");
      setStep(3);
      router.push("/(onboarding)/driver/license-capture" as Href);
    }
  };

  const handleRetakeAfterValidation = () => {
    setShowWrongDocModal(false);
    setNationalIdValidated(null);
    setFrontUri("");
    setBackUri("");
    setPhase("front");
  };

  /* ── Validating phase ── */
  if (phase === "validating") {
    return (
      <DriverStepShell
        stepIndex={2}
        title="Verifying document"
        description="Checking that the captured image is a valid Ghana Card..."
        buttonTitle=""
        buttonDisabled
        onContinue={() => {}}
      >
        <View style={styles.fallback}>
          <ActivityIndicator size="large" color="#2C3E5B" />
          <Text style={styles.fallbackText}>
            Analysing document type and authenticity...
          </Text>
        </View>
      </DriverStepShell>
    );
  }

  /* ── Wrong document modal ── */
  const wrongDocModal = (
    <Modal
      visible={showWrongDocModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowWrongDocModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIconWrap}>
            <Ionicons name="alert-circle" size={48} color="#E74C3C" />
          </View>
          <Text style={styles.modalTitle}>Wrong document detected</Text>
          <Text style={styles.modalBody}>
            The image you captured does not appear to be a Ghana National ID
            (Ghana Card). Please make sure you are scanning your National ID
            card, not your driver&rsquo;s license or another document.
          </Text>
          <Pressable
            style={styles.modalPrimaryBtn}
            onPress={handleRetakeAfterValidation}
          >
            <Text style={styles.modalPrimaryBtnText}>Retake Photos</Text>
          </Pressable>
          <Pressable
            style={styles.modalSecondaryBtn}
            onPress={() => {
              setShowWrongDocModal(false);
              // User insists — proceed anyway
              setNationalIdValidated(true);
              const { licenseFrontUri, licenseBackUri } =
                useDriverOnboardingStore.getState();
              setDocumentCapture(
                frontUri,
                backUri,
                licenseFrontUri,
                licenseBackUri,
              );
              setVerificationPipelineStatus("capturing");
              setStep(3);
              router.push("/(onboarding)/driver/license-capture" as Href);
            }}
          >
            <Text style={styles.modalSecondaryBtnText}>
              This is correct — continue anyway
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  /* ── Preview phase ── */
  if (phase === "preview") {
    return (
      <DriverStepShell
        stepIndex={2}
        title="Review your Ghana Card"
        description="Make sure both sides are clear and readable."
        buttonTitle="Looks Good — Continue"
        onContinue={handleContinue}
        onBack={handleRetake}
      >
        {wrongDocModal}
        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Front</Text>
            <Image source={{ uri: frontUri }} style={styles.previewImage} />
          </View>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Back</Text>
            <Image source={{ uri: backUri }} style={styles.previewImage} />
          </View>
          <Pressable style={styles.retakeBtn} onPress={handleRetake}>
            <Ionicons name="camera" size={16} color="#2C3E5B" />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </Pressable>
        </View>
      </DriverStepShell>
    );
  }

  /* ── Camera capture phases (front / back) ── */
  const isFront = phase === "front";

  return (
    <View style={styles.fullScreen}>
      <CameraViewComponent
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash="auto"
      />

      <View style={styles.overlay}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>
                {isFront ? "Front of Ghana Card" : "Back of Ghana Card"}
              </Text>
              <Text style={styles.headerSubtitle}>
                National ID — {isFront ? "Side 1 of 2" : "Side 2 of 2"}
              </Text>
            </View>
            <View style={styles.progressRing}>
              <View
                style={[
                  styles.progressDot,
                  { backgroundColor: isFront ? "#2ECC71" : "#FF7B54" },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Viewfinder */}
        <View style={styles.viewfinderWrap}>
          <DocumentViewfinder
            label={
              isFront
                ? "Align the front of your Ghana Card within the frame"
                : "Flip your card and align the back within the frame"
            }
          />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <Pressable
            style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={capturing}
          >
            <Text style={styles.captureBtnText}>
              {capturing ? "Capturing..." : "Hold Still & Capture"}
            </Text>
          </Pressable>

          {backUri && (
            <Pressable style={styles.skipBottomLink} onPress={handleRetake}>
              <Text style={styles.skipBottomText}>Retake previous</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.skipBottomLink}
            onPress={() => {
              setStep(3);
              router.push("/(onboarding)/driver/license-capture" as Href);
            }}
          >
            <Text style={styles.skipBottomText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ─── Document Viewfinder with green corner brackets ─── */
function DocumentViewfinder({ label }: { label: string }) {
  return (
    <View style={styles.viewfinder}>
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
      <View style={styles.viewfinderHint}>
        <Text style={styles.viewfinderHintText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
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

  /* Header */
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6E7E91",
    marginTop: 2,
  },
  progressRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#E8ECF0",
    alignItems: "center",
    justifyContent: "center",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  /* Viewfinder */
  viewfinderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinder: {
    width: "100%",
    aspectRatio: 1.586,
    maxHeight: 240,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#2ECC71",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  viewfinderHint: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewfinderHintText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },

  /* Bottom controls */
  bottomControls: {
    alignItems: "center",
    gap: 12,
  },
  captureBtn: {
    backgroundColor: "rgba(44, 62, 91, 0.9)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  captureBtnDisabled: { opacity: 0.6 },
  captureBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  skipBottomLink: { paddingVertical: 8 },
  skipBottomText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },

  /* Preview */
  previewContainer: {
    width: "100%",
    gap: 16,
    marginTop: 8,
  },
  previewCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1.586,
    resizeMode: "cover",
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  retakeBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
  },

  /* Permission screen */
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
  skipLinkText: {
    color: "#6E7E91",
    fontSize: 14,
    fontWeight: "500",
  },

  /* Wrong document modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  modalIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: "#E74C3C",
    borderRadius: 14,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  modalPrimaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalSecondaryBtn: {
    paddingVertical: 10,
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
  },
});
