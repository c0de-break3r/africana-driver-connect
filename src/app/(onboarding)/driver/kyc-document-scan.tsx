import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useKycFlowStore } from "@/store/useKycFlowStore";

type CapturePhase = "front" | "back" | "preview";

export default function KycDocumentScanScreen() {
  const {
    documentType,
    documentFrontUri,
    documentBackUri,
    setDocumentType,
    setDocumentCapture,
    setStep,
  } = useKycFlowStore();
  
  const [phase, setPhase] = useState<CapturePhase>(() => {
    if (documentFrontUri) {
      return documentBackUri ? "preview" : "back";
    }
    return "front";
  });
  
  const [capturing, setCapturing] = useState(false);
  const [showWrongDocModal, setShowWrongDocModal] = useState(false);

  const handleCapture = async () => {
    if (capturing) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate camera capture
    setTimeout(() => {
      const mockUri = `captured-${Date.now()}.jpg`;
      if (phase === "front") {
        setDocumentCapture(mockUri);
        setPhase("back");
      } else if (phase === "back") {
        setDocumentCapture(documentFrontUri, mockUri);
        setPhase("preview");
      }
      setCapturing(false);
    }, 1500);
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (phase === "preview") {
      setDocumentCapture("");
      setPhase("front");
    } else if (phase === "back") {
      setDocumentCapture("");
      setPhase("front");
    }
  };

  const handleContinue = () => {
    if (!documentFrontUri || !documentBackUri) return;
    
    // Validate document
    const isValid = Math.random() > 0.15; // 85% pass rate
    if (!isValid) {
      setShowWrongDocModal(true);
      return;
    }
    
    setStep(3);
    router.push("/(onboarding)/driver/kyc-liveness" as any);
  };

  if (phase === "preview" && documentFrontUri && documentBackUri) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Review your document</Text>
        <Text style={styles.subtitle}>Make sure both sides are clear and readable.</Text>

        <View style={styles.previewContainer}>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Front</Text>
            <Image source={{ uri: documentFrontUri }} style={styles.previewImage} />
          </View>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Back</Text>
            <Image source={{ uri: documentBackUri }} style={styles.previewImage} />
          </View>
        </View>

        {showWrongDocModal && (
          <Modal visible={true} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalIcon}>
                  <Ionicons name="alert-circle" size={48} color="#E74C3C" />
                </View>
                <Text style={styles.modalTitle}>Wrong document detected</Text>
                <Text style={styles.modalBody}>
                  The image does not appear to be a valid ID. Please retake.
                </Text>
                <Pressable style={styles.modalBtn} onPress={() => setShowWrongDocModal(false)}>
                  <Text style={styles.modalBtnText}>Retake</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}

        <View style={styles.controls}>
          <Pressable style={styles.retakeBtn} onPress={handleRetake}>
            <Ionicons name="camera" size={16} color="#2C3E5B" />
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
          <Pressable style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isFront = phase === "front";

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.progressText}>Choose ID</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStepActive}>
          <Ionicons name="scan" size={16} color="#FFFFFF" />
          <Text style={styles.progressText}>Scan ID</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <Ionicons name="person" size={16} color="#6E7E91" />
          <Text style={styles.progressText}>Selfie</Text>
        </View>
      </View>

      <Text style={styles.title}>{isFront ? "Front of document" : "Back of document"}</Text>
      <Text style={styles.subtitle}>
        Hold your {documentType === "national_id" ? "Ghana Card" : "Driver's License"} flat and in good light
      </Text>

      <View style={styles.captureFrame}>
        <View style={styles.framePlaceholder}>
          <Ionicons name="document-text" size={32} color="#2C3E5B" />
          <Text style={styles.frameHint}>Position document here</Text>
        </View>
      </View>

      <View style={styles.checklist}>
        <ChecklistItem text="Document is not expired" />
        <ChecklistItem text="Entire document fits in the frame" />
        <ChecklistItem text="Image is clear with no glare" />
        <ChecklistItem text="All text is clearly readable" />
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.primaryBtn} onPress={handleCapture} disabled={capturing}>
          {capturing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Open camera</Text>
          )}
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => {}}>
          <Text style={styles.secondaryBtnText}>Upload from library</Text>
        </Pressable>
      </View>
    </View>
  );
}

type ChecklistItemProps = {
  text: string;
};

function ChecklistItem({ text }: ChecklistItemProps) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
      <Text style={styles.checklistItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  progressStep: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  progressStepActive: {
    alignItems: "center",
    backgroundColor: "#2C3E5B",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressLine: {
    width: 20,
    height: 2,
    backgroundColor: "#E8ECF0",
  },
  progressText: {
    fontSize: 10,
    color: "#6E7E91",
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    marginBottom: 24,
  },
  captureFrame: {
    alignItems: "center",
    marginBottom: 24,
  },
  framePlaceholder: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderStyle: "dashed",
  },
  frameHint: {
    fontSize: 12,
    color: "#6E7E91",
    marginTop: 8,
  },
  checklist: {
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checklistItemText: {
    fontSize: 13,
    color: "#2C3E5B",
    marginLeft: 12,
    flex: 1,
  },
  buttons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  // Preview styles
  previewContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    flex: 1,
  },
  previewCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
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
  controls: {
    padding: 24,
    gap: 12,
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  retakeText: {
    fontSize: 14,
    color: "#2C3E5B",
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 16,
    maxWidth: 400,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    justifyContent: "center",
    alignItems: "center",
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
  modalBtn: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});