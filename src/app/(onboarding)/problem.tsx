import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";

/**
 * Problem screen — Act 1, Step 2.
 * States the user's struggle plainly before anything else.
 * Staggered entrance: card → headline → subtext → button.
 *
 * Layout reference: image-reference/onboarding/onboarding03–05.jpg
 */
export default function Problem() {
  // Staggered cascade: card → headline → subtext → button
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(15)).current;
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const subtextY = useRef(new Animated.Value(15)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      cardOpacity.setValue(0);
      cardY.setValue(20);
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      subtextOpacity.setValue(0);
      subtextY.setValue(15);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(cardY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
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
        Animated.sequence([
          Animated.delay(550),
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
        Animated.sequence([
          Animated.delay(700),
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
      cardOpacity,
      cardY,
      headlineOpacity,
      headlineY,
      subtextOpacity,
      subtextY,
      footerOpacity,
      footerY,
    ]),
  );

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    useOnboardingAnswersStore.getState().setLastCompletedScreen("problem");
    router.push("/(onboarding)/solution" as Href);
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
            <PageDots total={4} current={1} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Staggered content ── */}
        <View style={styles.body}>
          {/* Illustration card */}
          <Animated.View
            style={[
              styles.card,
              { opacity: cardOpacity, transform: [{ translateY: cardY }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🔍</Text>
            </View>
            <Text style={styles.cardLabel}>The Struggle</Text>
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
            Finding a driver you can actually trust takes weeks — or a lucky
            guess.
          </Animated.Text>

          {/* Supporting line */}
          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: subtextOpacity,
                transform: [{ translateY: subtextY }],
              },
            ]}
          >
            Unverified profiles, broken promises, and endless searching. Sound
            familiar?
          </Animated.Text>
        </View>

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
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    aspectRatio: 1.2,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 23, 42, 0.08)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 123, 84, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 48,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7E91",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    gap: 12,
  },
});
