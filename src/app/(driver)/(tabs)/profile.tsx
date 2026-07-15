import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Driver Profile tab — personal details, documents, settings, and logout.
 *
 * Placeholder: shows profile sections and a logout button. Real profile
 * editing and settings will be connected in a later task.
 */
export default function ProfileTab() {
  const { signOut } = useAuth();
  const { fullLegalName } = useDriverOnboardingStore();
  const resetRole = useRoleStore((s) => s.reset);

  const firstName = fullLegalName.split(" ")[0] || "Driver";

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
    resetRole();
    router.replace("/(onboarding)/welcome" as Href);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{fullLegalName || "Driver"}</Text>
          <Text style={styles.role}>Driver</Text>
        </View>

        {/* Section: Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          {ACCOUNT_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={styles.row}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as Href);
                }
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color="#2C3E5B"
                style={{ marginRight: 14 }}
              />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Section: Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          {SUPPORT_ITEMS.map((item) => (
            <Pressable key={item.label} style={styles.row}>
              <Ionicons
                name={item.icon as any}
                size={20}
                color="#2C3E5B"
                style={{ marginRight: 14 }}
              />
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowChevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const ACCOUNT_ITEMS = [
  { icon: "person", label: "Personal Details", route: null },
  {
    icon: "card",
    label: "Driver License",
    route: "/(driver)/complete-profile",
  },
  {
    icon: "document-text",
    label: "Documents",
    route: "/(driver)/complete-profile",
  },
  { icon: "star", label: "Ratings & Reviews", route: "/(driver)/ratings" },
  { icon: "wallet", label: "Wallet", route: "/(driver)/wallet" },
];

const SUPPORT_ITEMS = [
  { icon: "settings", label: "Settings", route: "/(driver)/settings" },
  { icon: "help-circle", label: "Help & Support", route: "/(driver)/help" },
];

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
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2C3E5B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6E7E91",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  rowChevron: {
    fontSize: 20,
    color: "#A0AAB4",
  },
  logoutBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E74C3C",
  },
});
