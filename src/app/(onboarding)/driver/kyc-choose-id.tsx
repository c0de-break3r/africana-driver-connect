import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycChooseIdScreen() {
  const {
    documentFrontUri,
    documentBackUri,
  } = useKycFlowStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null!);

  const requestCameraPermission = async () => {
    const { status } = await requestPermission();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in your device settings.",
        [{ text: "OK" }]
      );
      return false;
    }
    router.push("/(onboarding)/driver/kyc-scan-id" as any);
    return true;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <View style={styles.numberProgressContainer}>
        <View style={styles.horizontalProgressRow}>
          <View style={styles.stepItem}>
            <View style={documentFrontUri ? styles.numberCircleCompleted : styles.numberCircleActive}>
              {documentFrontUri ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.numberText}>1</Text>
              )}
            </View>
            <Text style={styles.stepName}>Choose ID</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.stepItem}>
            <View style={documentBackUri ? styles.numberCircleCompleted : styles.numberCircleActive}>
              {documentBackUri ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={styles.numberText}>2</Text>
              )}
            </View>
            <Text style={styles.stepName}>Scan ID</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.stepItem}>
            <View style={styles.numberCircleActive}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <Text style={styles.stepName}>Selfie</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Front & Back of document</Text>
      <Text style={styles.subtitle}>
        Hold your ID flat and in good light
      </Text>

      <View style={styles.captureFrame}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.frameBorder}>
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
      </View>

      <View style={styles.checklistSection}>
        <Text style={styles.checklistLabel}>MAKE SURE THAT</Text>
        <ChecklistItem text="Document is not expired" />
        <ChecklistItem text="Entire document fits in the frame" />
        <ChecklistItem text="Image is clear with no glare" />
        <ChecklistItem text="All text is clearly readable" />
      </View>

      <View style={styles.buttons}>
        <Pressable style={styles.primaryBtn} onPress={requestCameraPermission}>
          <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Request permission</Text>
        </Pressable>
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
    backgroundColor: "#FFF8F3",
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
  numberProgressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  horizontalProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    alignItems: "center",
  },
  stepName: {
    fontSize: 12,
    color: "#6E7E91",
    fontWeight: "500",
    marginTop: 4,
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
    marginLeft: 8,
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
  camera: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#000000",
    borderStyle: "dashed",
    backgroundColor: "#F5F6F8",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  frameCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#000000",
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
    borderColor: "#000000",
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
    borderColor: "#000000",
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
    borderColor: "#000000",
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
    color: "#6E7E91",
    marginTop: 16,
  },
  checklistSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  checklistLabel: {
    fontSize: 10,
    color: "#6E7E91",
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
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});