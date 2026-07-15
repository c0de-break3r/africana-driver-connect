import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";
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
 * Matches Role Selection.html: progress bar, header, 4 cards, sticky CTA.
 *
 * On selection: stores role in Zustand (AsyncStorage-persisted),
 * then routes to (auth)/sign-in.
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
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-foreground">
            Choose Your Role
          </Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-5">
            Select how you would like to participate in the Africana
            marketplace. You can add extra roles later.
          </Text>
        </View>

        {/* ── Role cards ── */}
        <View className="px-6 gap-4 pb-32">
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

                  <View className="flex-row gap-4">
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
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">
                        {role.title}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-1 leading-5">
                        {role.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Bottom sticky CTA ── */}
      <View style={styles.stickyBottom}>
        <PrimaryButton
          title="Continue to Setup"
          onPress={handleContinue}
          disabled={!selected}
          style={{ width: "100%" }}
        />
      </View>
    </ScreenContainer>
  );
}

/* ──────────────────────────────────────────────
 * Styles — StyleSheet for Pressable / shadow /
 * dynamic states (per AGENTS.md exception rules)
 * ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 120,
  },

  /* Progress bar */
  progressBar: {
    height: 6,
    width: "100%",
    backgroundColor: "#F5ECE5",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF7B54",
    borderRadius: 999,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6E7E91",
  },
  progressHighlight: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF7B54",
  },

  /* Cards */
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
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

  /* Check badge */
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

  /* Icon box */
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

  /* Sticky bottom */
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "#FFF8F3",
  },
});
