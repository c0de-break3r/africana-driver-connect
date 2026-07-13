import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";

/**
 * Bridge screen — Act 1, Step 8.
 * Emotional pivot: turns the bombshell stat into hope + momentum.
 * Personalized headline referencing the user's name.
 *
 * Design reference: onboarding11.jpg (hope / trust signal pattern).
 */
export default function Bridge() {
  const firstName = useOnboardingAnswersStore((s) => s.firstName) ?? "there";

  // Staggered animations
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(15)).current;
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const subtextY = useRef(new Animated.Value(10)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(15)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      // Reset all
      iconOpacity.setValue(0);
      iconScale.setValue(0.5);
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      subtextOpacity.setValue(0);
      subtextY.setValue(10);
      cardOpacity.setValue(0);
      cardY.setValue(15);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        // 1. Icon bounces in — 100ms
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(iconOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
              toValue: 1,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 2. Headline — 400ms
        Animated.sequence([
          Animated.delay(400),
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

        // 3. Subtext — 650ms
        Animated.sequence([
          Animated.delay(650),
          Animated.parallel([
            Animated.timing(subtextOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(subtextY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 4. Mini stat card — 850ms
        Animated.sequence([
          Animated.delay(850),
          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(cardY, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 5. Footer — 1050ms
        Animated.sequence([
          Animated.delay(1050),
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
      iconOpacity,
      iconScale,
      headlineOpacity,
      headlineY,
      subtextOpacity,
      subtextY,
      cardOpacity,
      cardY,
      footerOpacity,
      footerY,
    ]),
  );

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useOnboardingAnswersStore.getState().setLastCompletedScreen("bridge");
    router.push("/(onboarding)/question-bank" as Href);
  };

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={8} current={7} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content ── */}
        <View style={styles.body}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconWrap,
              { opacity: iconOpacity, transform: [{ scale: iconScale }] },
            ]}
          >
            <Text style={styles.iconEmoji}>✨</Text>
          </Animated.View>

          {/* Headline */}
          <Animated.Text
            style={[
              styles.headline,
              {
                opacity: headlineOpacity,
                transform: [{ translateY: headlineY }],
              },
            ]}
          >
            It doesn&apos;t have to be this way, {firstName}.
          </Animated.Text>

          {/* Subtext */}
          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: subtextOpacity,
                transform: [{ translateY: subtextY }],
              },
            ]}
          >
            Let&apos;s build your plan. A few quick questions and we&apos;ll
            have a personalized roadmap ready for you.
          </Animated.Text>

          {/* Mini momentum card */}
          <Animated.View
            style={[
              styles.momentumCard,
              { opacity: cardOpacity, transform: [{ translateY: cardY }] },
            ]}
          >
            <View style={styles.momentumRow}>
              <Text style={styles.momentumIcon}>🎯</Text>
              <Text style={styles.momentumText}>
                Personalized to your goals
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.momentumRow}>
              <Text style={styles.momentumIcon}>⚡</Text>
              <Text style={styles.momentumText}>Takes less than 2 minutes</Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: footerOpacity, transform: [{ translateY: footerY }] },
          ]}
        >
          <PrimaryButton
            title="Let's Go"
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
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 193, 7, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 36,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  momentumCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  momentumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  momentumIcon: {
    fontSize: 20,
  },
  momentumText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2C3E5B",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8ECF0",
    marginVertical: 14,
  },
  footer: {
    gap: 12,
  },
});
