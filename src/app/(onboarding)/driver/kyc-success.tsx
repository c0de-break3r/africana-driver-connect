import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";

export default function KycSuccessScreen() {
  const { reset } = useKycFlowStore();

  const handleDone = () => {
    reset();
    router.replace("/(driver)" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.checkIcon}>
          <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Identity verified!</Text>
        <Text style={styles.subtitle}>
          Your identity has been successfully verified. You can now start accepting rides.
        </Text>

        <View style={styles.confidence}>
          <Text style={styles.confidenceLabel}>Face match confidence</Text>
          <Text style={styles.confidenceValue}>95.5%</Text>
        </View>

        <Pressable style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>Continue to Dashboard</Text>
        </Pressable>
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
    gap: 24,
  },
  checkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#27AE60",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
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
  confidence: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#6E7E91",
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  doneBtn: {
    backgroundColor: "#2C3E5B",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});