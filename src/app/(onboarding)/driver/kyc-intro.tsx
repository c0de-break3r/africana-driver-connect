import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useKycFlowStore } from "@/store/useKycFlowStore";
import { Ionicons } from "@expo/vector-icons";

export default function KycIntroScreen() {
  const { setStep, setConsentGiven } = useKycFlowStore();

  const handleStart = () => {
    try {
      setConsentGiven(false);
      setStep(2);
      router.push("/(auth)/sign-in" as any);
    } catch (error) {
      console.error("KYC navigation error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <View style={styles.graphicsContainer}>
        <View style={styles.idCardContainer}>
          <View style={styles.idCard}>
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoInner} />
            </View>
            <View style={styles.textLine} />
            <View style={[styles.textLine, styles.textLineLong]} />
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Step 1 of 3</Text>
        </View>

        <Text style={styles.title}>Verify your identity</Text>

        <Text style={styles.subtitle}>
          It takes about 2 minutes to verify your identity. We need to confirm it&apos;s really you before you can start accepting rides.
        </Text>

        <View style={styles.checklist}>
          <ChecklistItem number={1} title="Scan your ID" description="Passport, driving licence, or national ID card" isActive />
          <ChecklistItem number={2} title="Take a selfie" description="We&apos;ll match your face to your ID photo" isActive />
          <ChecklistItem number={3} title="Get verified" description="Usually instant, sometimes a few hours" isActive />
        </View>

        <Pressable style={styles.continueBtn} onPress={handleStart}>
          <Text style={styles.continueText}>Start verification</Text>
        </Pressable>

        <View style={styles.disclosure}>
          <Ionicons name="lock-closed" size={16} color="#6E7E91" />
          <Text style={styles.disclosureText}>
            Your data is encrypted, used only for identity verification, and deleted after 90 days.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

type ChecklistItemProps = {
  number: number;
  title: string;
  description: string;
  isActive?: boolean;
};

function ChecklistItem({ number, title, description, isActive }: ChecklistItemProps) {
  return (
    <View style={styles.checklistItem}>
      <View style={[styles.checklistNumber, isActive && styles.checklistNumberActive]}>
        <Text style={styles.checklistNumberText}>{number}</Text>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
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
  graphicsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  idCardContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  idCard: {
    width: 200,
    height: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8ECF0",
    transform: [{ rotate: "-8deg" }],
    padding: 12,
    justifyContent: "space-between",
  },
  photoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#E8ECF0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  photoInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#CBD5E0",
  },
  textLine: {
    height: 2,
    backgroundColor: "#E8ECF0",
    borderRadius: 1,
    marginBottom: 6,
  },
  textLineLong: {
    width: "80%",
  },
  profileIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2C3E5B",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
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
    marginBottom: 16,
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
  checklistNumberActive: {
    backgroundColor: "#FF7B54",
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
  continueBtn: {
    backgroundColor: "#2C3E5B",
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
