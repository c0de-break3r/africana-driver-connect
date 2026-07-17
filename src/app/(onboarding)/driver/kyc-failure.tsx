import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycFailureScreen() {
  const { reset } = useKycFlowStore();

  const handleRetry = () => {
    reset();
    router.push("/(onboarding)/driver/kyc-intro" as any);
  };

  const handleSupport = () => {
    // Open support
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle" size={64} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Verification needs review</Text>
        <Text style={styles.subtitle}>
          We couldn't confirm a match from the selfie. Our team will manually review your documents.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="time" size={20} color="#2C3E5B" />
          <Text style={styles.infoText}>
            You'll receive a notification within 24 hours. You can still use limited features in the meantime.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>Retry Verification</Text>
          </Pressable>
          
          <Pressable style={styles.supportBtn} onPress={handleSupport}>
            <Ionicons name="help-circle" size={16} color="#2C3E5B" />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFC107",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F6F8",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#2C3E5B",
    marginLeft: 12,
    lineHeight: 18,
    flex: 1,
  },
  actions: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 12,
  },
  retryBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2C3E5B",
    paddingVertical: 14,
    borderRadius: 12,
  },
  supportBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    marginLeft: 8,
  },
});