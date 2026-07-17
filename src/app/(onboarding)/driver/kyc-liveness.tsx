import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycLivenessScreen() {
  const { livenessResult, setLivenessResult, setStatus } = useKycFlowStore();
  const [processing, setProcessing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const handleCapture = async () => {
    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate liveness check
    setTimeout(() => {
      const passed = Math.random() > 0.1; // 90% pass rate
      const confidence = 85 + Math.random() * 14;
      
      setLivenessResult({
        passed,
        confidence: Math.round(confidence * 10) / 10,
        reason: passed ? undefined : "Face match confidence below threshold",
      });
      
      if (passed) {
        setStatus("confirmed");
        router.push("/(onboarding)/driver/kyc-success" as Href);
      } else {
        setStatus("failed");
        router.push("/(onboarding)/driver/kyc-failure" as Href);
      }
      setProcessing(false);
    }, 2000);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    router.back();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleExit} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#2C3E5B" />
        </Pressable>
        <Text style={styles.helpLink}>Help</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.step}>Step 3 of 3</Text>
        
        <View style={styles.ovalContainer}>
          <View style={styles.oval}>
            <View style={styles.ellipse} />
            <Text style={styles.instruction}>Center your face within the oval</Text>
          </View>
        </View>

        <View style={styles.indicators}>
          <Indicator icon="sunny" label="Good light" active={true} />
          <Indicator icon="hand-paper" label="Stay still" active={true} />
          <Indicator icon="face" label="Face forward" active={true} />
        </View>

        <Pressable style={styles.captureBtn} onPress={handleCapture} disabled={processing}>
          {processing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.captureBtnText}>Capture</Text>
          )}
        </Pressable>

        <View style={styles.consent}>
          <Text style={styles.consentText}>
            By capturing, you consent to biometric processing for identity verification. 
            <Text style={styles.policyLink}> Privacy Policy</Text>
          </Text>
        </View>
      </View>

      {showExitDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Exit verification?</Text>
            <Text style={styles.dialogBody}>
              Your progress will be lost. You'll need to restart verification later.
            </Text>
            <View style={styles.dialogButtons}>
              <Pressable style={styles.dialogBtn} onPress={handleCancelExit}>
                <Text style={styles.dialogBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.dialogBtnPrimary} onPress={handleConfirmExit}>
                <Text style={styles.dialogBtnTextPrimary}>Exit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

type IndicatorProps = {
  icon: string;
  label: string;
  active: boolean;
};

function Indicator({ icon, label, active }: IndicatorProps) {
  return (
    <View style={styles.indicator}>
      <View style={[styles.indicatorIcon, active && styles.indicatorActive]}>
        <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.indicatorLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  helpLink: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  step: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginBottom: 32,
    opacity: 0.8,
  },
  ovalContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  oval: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  ellipse: {
    width: 200,
    height: 240,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    position: "absolute",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 12,
  },
  indicators: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 40,
  },
  indicator: {
    alignItems: "center",
    gap: 6,
  },
  indicatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorActive: {
    backgroundColor: "#2C3E5B",
  },
  indicatorLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF7B54",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  consent: {
    marginTop: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  consentText: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 16,
  },
  policyLink: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  dialogOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    maxWidth: 360,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  dialogBody: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 12,
  },
  dialogBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dialogBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
  },
  dialogBtnPrimary: {
    backgroundColor: "#E74C3C",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dialogBtnTextPrimary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});