import { Link, router, useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";
import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function KycIntroScreen() {
  const { setStep, setConsentGiven } = useKycFlowStore();

  const handleStart = () => {
    try {
      setConsentGiven(false);
      setStep(2);
      router.push("/(onboarding)/driver/kyc-document-scan" as any);
    } catch (error) {
      console.error("KYC navigation error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Step 1 of 3</Text>
        </View>

        <Text style={styles.title}>Verify your identity</Text>

        <Text style={styles.subtitle}>
          It takes about 2 minutes to verify your identity. We need to confirm it's really you before you can start accepting rides.
        </Text>

        <View style={styles.checklist}>
          <ChecklistItem number={1} title="Scan your ID" description="Passport, driving licence, or national ID card" />
          <ChecklistItem number={2} title="Take a selfie" description="We'll match your face to your ID photo" />
          <ChecklistItem number={3} title="Get verified" description="Usually instant, sometimes a few hours" />
        </View>

        <View style={styles.disclosure}>
          <Ionicons name="lock-closed" size={16} color="#6E7E91" />
          <Text style={styles.disclosureText}>
            Your data is encrypted, used only for identity verification, and deleted after 90 days.
          </Text>
        </View>

        <Pressable style={styles.continueBtn} onPress={handleStart}>
          <Text style={styles.continueText}>Continue →</Text>
        </Pressable>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type ChecklistItemProps = {
  number: number;
  title: string;
  description: string;
};

function ChecklistItem({ number, title, description }: ChecklistItemProps) {
  return (
    <View style={styles.checklistItem}>
      <View style={styles.checklistNumber}>{number}</View>
      <View style={styles.checklistContent}>
        <Text style={styles.checklistTitle}>{title}</Text>
        <Text style={styles.checklistDesc}>{description}</Text>
      </View>
    </View>
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  stepBadge: {
    backgroundColor: "#E8ECF0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  stepText: {
    fontSize: 12,
    color: "#6E7E91",
    fontWeight: "500",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  checklist: {
    marginBottom: 24,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  checklistNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2C3E5B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  checklistNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 2,
  },
  checklistDesc: {
    fontSize: 12,
    color: "#6E7E91",
    lineHeight: 16,
  },
  disclosure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6F8",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclosureText: {
    fontSize: 11,
    color: "#6E7E91",
    textAlign: "center",
    marginLeft: 8,
    flex: 1,
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
    color: "#6E7E91",
    fontWeight: "500",
  },
  continueBtn: {
    backgroundColor: "#FF7B54",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});