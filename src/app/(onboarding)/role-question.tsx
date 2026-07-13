import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore, type UserRole } from "@/store/useRoleStore";

/**
 * Role question screen — Act 1, Step 5.
 * Personalized headline + four struggle-based answer cards.
 * Stores the selected role in useRoleStore (AsyncStorage-persisted).
 *
 * Layout reference: onboarding card selection pattern.
 */

type StruggleCard = {
  key: UserRole;
  icon: string;
  struggle: string;
};

const STRUGGLES: StruggleCard[] = [
  {
    key: "driver",
    icon: "🚗",
    struggle: "I can't find reliable work as a driver",
  },
  {
    key: "owner",
    icon: "🔑",
    struggle: "I can't find drivers I can trust",
  },
  {
    key: "client",
    icon: "📍",
    struggle: "I need a driver for an occasion or trip",
  },
  {
    key: "corporate",
    icon: "🏢",
    struggle: "I need to outsource drivers or fleet for my organization",
  },
];

export default function RoleQuestion() {
  const firstName = useOnboardingAnswersStore((s) => s.firstName) ?? "there";
  const setRole = useRoleStore((s) => s.setRole);
  const [selected, setSelected] = useState<UserRole | null>(null);

  // Staggered animations
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(15)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      cardsOpacity.setValue(0);
      cardsY.setValue(20);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(headlineOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(headlineY, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(cardsOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cardsY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(footerOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(footerY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }, [
      headlineOpacity,
      headlineY,
      cardsOpacity,
      cardsY,
      footerOpacity,
      footerY,
    ]),
  );

  const handleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(role);
  };

  const handleContinue = () => {
    if (!selected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(selected);
    useOnboardingAnswersStore
      .getState()
      .setLastCompletedScreen("role-question");
    router.push("/(onboarding)/foundational-questions" as Href);
  };

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar: back + dots ── */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={5} current={4} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Headline ── */}
        <Animated.View
          style={{
            opacity: headlineOpacity,
            transform: [{ translateY: headlineY }],
          }}
        >
          <Text style={styles.headline}>
            What&apos;s slowing you down right now, {firstName}?
          </Text>
        </Animated.View>

        {/* ── Struggle cards ── */}
        <Animated.View
          style={[
            styles.cardsWrap,
            { opacity: cardsOpacity, transform: [{ translateY: cardsY }] },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.cardsList}>
              {STRUGGLES.map((card) => {
                const isSelected = selected === card.key;
                return (
                  <Pressable
                    key={card.key}
                    onPress={() => handleSelect(card.key)}
                  >
                    <View
                      style={[
                        styles.card,
                        isSelected ? styles.cardSelected : styles.cardDefault,
                      ]}
                    >
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                      )}
                      <View style={styles.cardInner}>
                        <View
                          style={[
                            styles.iconBox,
                            isSelected
                              ? styles.iconBoxSelected
                              : styles.iconBoxDefault,
                          ]}
                        >
                          <Text style={styles.iconEmoji}>{card.icon}</Text>
                        </View>
                        <Text
                          style={[
                            styles.cardText,
                            isSelected && styles.cardTextSelected,
                          ]}
                        >
                          {card.struggle}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: footerOpacity, transform: [{ translateY: footerY }] },
          ]}
        >
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            style={{ width: "100%" }}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
    marginTop: -2,
  },
  dotsWrap: {
    flex: 1,
  },
  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
    marginTop: 16,
    marginBottom: 24,
  },
  cardsWrap: {
    flex: 1,
  },
  cardsList: {
    gap: 14,
    paddingBottom: 16,
  },
  card: {
    padding: 18,
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
    borderColor: "#2C3E5B",
    shadowColor: "rgba(44, 62, 91, 0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardDefault: {
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  checkBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2C3E5B",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "rgba(44, 62, 91, 0.08)",
  },
  iconBoxDefault: {
    backgroundColor: "rgba(44, 62, 91, 0.04)",
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 22,
  },
  cardTextSelected: {
    color: "#2C3E5B",
    fontWeight: "600",
  },
  footer: {
    gap: 12,
  },
});
