import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";
import { useRoleStore, type UserRole } from "@/store/useRoleStore";


/* ──────────────────────────────────────────────
 * Role definitions — each card is a genuine fork
 * ────────────────────────────────────────────── */

type RoleOption = {
  key: UserRole;
  icon: string;
  title: string;
  description: string;
};

const ROLES: RoleOption[] = [
  {
    key: "driver",
    icon: "⚡",
    title: "Driver",
    description: "I drive — find job opportunities",
  },
  {
    key: "owner",
    icon: "🚛",
    title: "Vehicle Owner",
    description: "I own a vehicle — find drivers to hire",
  },
  {
    key: "client",
    icon: "👤",
    title: "Client",
    description: "I need a ride or driver for an occasion",
  },
  {
    key: "corporate",
    icon: "🏢",
    title: "Corporate Client",
    description: "I manage outsourced drivers or fleets for my organization",
  },
];

/* ──────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────── */

/**
 * Role selection — the core UX fork of the entire app.
 * Matches kyc-intro.tsx positioning: SafeAreaView with top edges, header, ScrollView content.
 */
export default function RoleSelect() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const setRole = useRoleStore((s) => s.setRole);

  const handleContinue = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(selected);
    router.push("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step Badge ── */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>Choose Your Role</Text>
        </View>

        <Text style={styles.title}>Select how you will participate</Text>

        <Text style={styles.subtitle}>
          Choose your role in the Africana marketplace. You can add extra roles
          later in settings.
        </Text>

        {/* ── Role cards ── */}
        <View style={styles.cardsContainer}>
          {ROLES.map((role) => {
            const isSelected = selected === role.key;
            return (
              <Pressable
                key={role.key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelected(role.key);
                }}
              >
                <View
                  style={[
                    styles.card,
                    isSelected ? styles.cardSelected : styles.cardDefault,
                  ]}
                >
                  {/* Checkmark badge when selected */}
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}

                  <View style={styles.cardRow}>
                    {/* Icon */}
                    <View
                      style={[
                        styles.iconBox,
                        isSelected
                          ? styles.iconBoxSelected
                          : styles.iconBoxDefault,
                      ]}
                    >
                      <Text style={styles.iconEmoji}>{role.icon}</Text>
                    </View>

                    {/* Text */}
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{role.title}</Text>
                      <Text style={styles.cardDesc}>{role.description}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── CTA Button (in scroll flow) ── */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continue to Setup"
            onPress={handleContinue}
            disabled={!selected}
            style={{ width: "100%" }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ──────────────────────────────────────────────
 * Styles — StyleSheet for Pressable / shadow /
 * dynamic states (per AGENTS.md exception rules)
 * ────────────────────────────────────────────── */

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
  scroll: {
    flexGrow: 1,
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
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#FF7B54",
    shadowColor: "rgba(255, 123, 84, 0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: "#EAE1D9",
  },
  checkBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF7B54",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "rgba(255, 123, 84, 0.1)",
  },
  iconBoxDefault: {
    backgroundColor: "rgba(44, 62, 91, 0.05)",
  },
  iconEmoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  cardDesc: {
    fontSize: 12,
    color: "#6E7E91",
    marginTop: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
