import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

/**
 * Driver home dashboard.
 *
 * Shows a personalized greeting and a "Complete your profile" banner on first
 * load. The banner links to the full profile completion flow where the driver
 * uploads their license photo, Ghana Card, and police clearance.
 */
export default function DriverHomeScreen() {
  const {
    fullLegalName,
    licenseClass,
    vehicleTypes,
    profileDocumentsUploaded,
    markProfileDocumentsUploaded,
  } = useDriverOnboardingStore();

  const showCompleteProfileBanner = !profileDocumentsUploaded;

  const handleCompleteProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the full profile completion flow.
    router.push("/(driver)/complete-profile" as Href);
  };

  const handleDismissBanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markProfileDocumentsUploaded();
  };

  const firstName = fullLegalName.split(" ")[0] || "Driver";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back, {firstName}</Text>
          <Text style={styles.subGreeting}>
            Let&apos;s find your next driving opportunity.
          </Text>
        </View>

        {/* Complete profile banner */}
        {showCompleteProfileBanner && (
          <Pressable
            style={styles.banner}
            onPress={handleCompleteProfile}
            accessibilityRole="button"
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                <Text style={styles.bannerIconText}>📋</Text>
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Complete your profile</Text>
                <Text style={styles.bannerBody}>
                  Upload your license photo, Ghana Card, and police clearance to
                  unlock verified jobs.
                </Text>
              </View>
              <Pressable
                onPress={handleDismissBanner}
                hitSlop={8}
                style={styles.dismissBtn}
              >
                <Text style={styles.dismissText}>×</Text>
              </Pressable>
            </View>
          </Pressable>
        )}

        {/* Job match context */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for you</Text>
          <Text style={styles.sectionBody}>
            Jobs will be filtered by your license class{" "}
            {licenseClass ? `(${licenseClass})` : ""} and vehicle types{" "}
            {vehicleTypes.length > 0 ? `(${vehicleTypes.join(", ")})` : ""}.
          </Text>
        </View>

        {/* Placeholder job cards */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🚗</Text>
          <Text style={styles.emptyStateTitle}>No jobs yet</Text>
          <Text style={styles.emptyStateBody}>
            Once your profile is complete, matched jobs will appear here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    lineHeight: 36,
  },
  subGreeting: {
    fontSize: 15,
    color: "#6E7E91",
    marginTop: 4,
  },
  banner: {
    backgroundColor: "#2C3E5B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerIconText: {
    fontSize: 22,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bannerBody: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 18,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: {
    fontSize: 22,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    color: "#6E7E91",
    lineHeight: 20,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 6,
  },
  emptyStateBody: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
});
