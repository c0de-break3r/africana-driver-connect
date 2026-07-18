import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycBackIdScreen() {
  const {
    documentFrontUri,
    documentBackUri,
    setDocumentCapture,
    setStep,
    documentType,
  } = useKycFlowStore();

  const [capturing, setCapturing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [backOfCardError, setBackOfCardError] = useState<string | null>(null);
  const [qualityFeedback, setQualityFeedback] = useState<string>("");
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [documentDetected, setDocumentDetected] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null!);
  const processBackOfCard = useMutation(api.kyc.processBackOfCard);

  const requestMediaPermission = async () => {
    const { status } = await requestPermission();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleCapture = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    if (capturing || !cameraReady) return;
    setCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setCapturedImage(photo.uri);
        await handleBackOfCardSubmit(photo.uri);
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      Alert.alert(
        "Capture Failed",
        "Could not capture image. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setCapturing(false);
    }
  };

  const handleBackOfCardSubmit = async (uri: string) => {
    setProcessing(true);
    setBackOfCardError(null);
    
    try {
      const result = await processBackOfCard({
        documentBackUri: uri,
        documentType: documentType || "national_id",
      });
      
      setDocumentCapture(documentFrontUri, uri);
      setStep(3);
      router.push("/(onboarding)/driver/kyc-liveness" as any);
    } catch (error) {
      console.error("Back of card processing error:", error);
      setBackOfCardError("Could not process document. Please try again.");
      setCapturedImage(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpload = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    const mockUri = "https://via.placeholder.com/300x400/2C3E5B/FFFFFF?text=Upload";
    setDocumentCapture(documentFrontUri, mockUri);
    setStep(3);
    router.push("/(onboarding)/driver/kyc-liveness" as any);
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedImage(null);
    setBackOfCardError(null);
    setQualityFeedback("");
  };

  const handleBack = () => {
    router.push("/(onboarding)/driver/kyc-scan-id" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {!processing && !capturedImage ? (
        <CameraView
          ref={cameraRef}
          style={styles.cameraFull}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
      ) : capturedImage ? (
        <Image source={{ uri: capturedImage }} style={styles.cameraFull} />
      ) : null}

      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <View style={styles.progressOverlay}>
        <View style={styles.progressRow}>
          <View style={styles.numberCircleCompleted}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
          <View style={styles.progressLine} />
          <View style={documentBackUri ? styles.numberCircleCompleted : styles.numberCircleActive}>
            {documentBackUri ? (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            ) : (
              <Text style={styles.numberText}>2</Text>
            )}
          </View>
          <View style={styles.progressLine} />
          <View style={styles.numberCircleActive}>
            <Text style={styles.numberText}>3</Text>
          </View>
        </View>
      </View>

      <View style={styles.overlay}>
        {qualityFeedback ? (
          <Text style={styles.feedbackText}>{qualityFeedback}</Text>
        ) : null}

        <View style={styles.captureFrame}>
          <View style={[styles.frameBorder, documentDetected && styles.frameDetected]}>
            <View style={styles.frameCornerTopLeft} />
            <View style={styles.frameCornerTopRight} />
            <View style={styles.frameCornerBottomLeft} />
            <View style={styles.frameCornerBottomRight} />
            <View style={styles.frameContent}>
              <View style={styles.idCardInFrame}>
                <View style={styles.idCardPhotoPlaceholderLeft}>
                  <View style={styles.idCardPhotoInner} />
                </View>
                <View style={styles.idCardTextLine} />
                <View style={styles.idCardTextLineLong} />
                <View style={styles.profileIconInCard}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.frameHint}>Position document here</Text>
            </View>
          </View>
        </View>

        <View style={styles.checklistSection}>
          <Text style={styles.checklistLabel}>MAKE SURE THAT</Text>
          <ChecklistItem text="Document is not expired" />
          <ChecklistItem text="Entire document fits in the frame" />
          <ChecklistItem text="Image is clear with no glare" />
          <ChecklistItem text="All text is clearly readable" />
        </View>

        {backOfCardError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#FF7B54" />
            <Text style={styles.errorText}>{backOfCardError}</Text>
            <Pressable style={styles.retakeBtn} onPress={() => setBackOfCardError(null)}>
              <Text style={styles.retakeBtnText}>Retake</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.buttons}>
            <Pressable 
              style={[styles.primaryBtn, (processing || !cameraReady) && styles.disabledBtn]} 
              onPress={handleCapture} 
              disabled={capturing || !cameraReady || processing}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.primaryBtnContent}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Capture</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={handleUpload}>
              <Text style={styles.secondaryBtnText}>Upload from photo library</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

type ChecklistItemProps = {
  text: string;
};

function ChecklistItem({ text }: ChecklistItemProps) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons name="checkmark-circle" size={20} color="#FF7B54" />
      <Text style={styles.checklistItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  cameraFull: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
  },
  progressOverlay: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#E8ECF0",
    marginHorizontal: 8,
  },
  numberCircleCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF7B54",
    justifyContent: "center",
    alignItems: "center",
  },
  numberCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C3E5B",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 16,
    backgroundColor: "rgba(44, 62, 91, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  captureFrame: {
    alignItems: "center",
    marginBottom: 24,
  },
  frameBorder: {
    width: 280,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
    backgroundColor: "rgba(245, 246, 248, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  frameDetected: {
    borderColor: "#FF7B54",
    backgroundColor: "rgba(255, 123, 84, 0.2)",
  },
  frameCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFFFFF",
    borderTopLeftRadius: 4,
  },
  frameCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FFFFFF",
    borderTopRightRadius: 4,
  },
  frameCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  frameCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FFFFFF",
    borderBottomRightRadius: 4,
  },
  frameContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  idCardInFrame: {
    width: 180,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    transform: [{ rotate: "-8deg" }],
    padding: 12,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  idCardPhotoPlaceholderLeft: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#E8ECF0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  idCardPhotoInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#CBD5E0",
  },
  idCardTextLine: {
    height: 3,
    backgroundColor: "#E0E4E8",
    borderRadius: 1,
    marginBottom: 8,
    width: "100%",
  },
  idCardTextLineLong: {
    height: 3,
    backgroundColor: "#E0E4E8",
    borderRadius: 1,
    width: "80%",
  },
  profileIconInCard: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2C3E5B",
    justifyContent: "center",
    alignItems: "center",
  },
  frameHint: {
    fontSize: 12,
    color: "#FFFFFF",
    marginTop: 16,
  },
  checklistSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  checklistLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checklistItemText: {
    fontSize: 14,
    color: "#FFFFFF",
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
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  primaryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  errorContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#FF7B54",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  retakeBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retakeBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});