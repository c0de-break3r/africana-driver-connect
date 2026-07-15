import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Driver Notifications tab — grouped notification list.
 *
 * Placeholder: shows sample notification categories. Real notifications
 * will be connected in a later task.
 */
export default function NotificationsTab() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Stay up to date with job offers, interview invites, and more.
        </Text>

        {/* Notification categories */}
        {CATEGORIES.map((category) => (
          <View key={category.label} style={styles.categoryRow}>
            <View style={styles.categoryIcon}>
              <Ionicons name={category.icon as any} size={20} color="#2C3E5B" />
            </View>
            <View style={styles.categoryText}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDesc}>{category.description}</Text>
            </View>
          </View>
        ))}

        {/* Empty state */}
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-off-outline"
            size={40}
            color="#6E7E91"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyTitle}>No new notifications</Text>
          <Text style={styles.emptyBody}>
            You&apos;ll see updates here when something happens.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CATEGORIES = [
  {
    icon: "briefcase",
    label: "New Jobs",
    description: "Matched opportunities based on your profile",
  },
  {
    icon: "calendar",
    label: "Interview Invites",
    description: "Requests from vehicle owners and employers",
  },
  {
    icon: "checkmark-circle",
    label: "Application Updates",
    description: "Accepted or rejected job applications",
  },
  {
    icon: "wallet",
    label: "Payment Updates",
    description: "Earnings, payouts, and wallet activity",
  },
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: "#6E7E91",
    marginTop: 4,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    gap: 14,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 2,
  },
  categoryDesc: {
    fontSize: 13,
    color: "#6E7E91",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF0",
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
});
