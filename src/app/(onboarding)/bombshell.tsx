import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Bombshell screen — Act 1, Step 7.
 * Personalized data-snapshot: one large stat computed from the user's
 * name, role, and foundational answers. Emotional high point of Act 1.
 *
 * Design reference: onboarding11.jpg (large stat + trust signal pattern).
 */

/* ──────────────────────────────────────────────
 * Stat config per role
 * ────────────────────────────────────────────── */

type StatConfig = {
  bigNumber: string;
  countUpTarget: number;
  suffix: string;
  headline: string;
  subtext: string;
  accentColor: string;
  accentBg: string;
  icon: string;
};

function buildStat(
  role: string | null,
  answers: ReturnType<typeof useOnboardingAnswersStore.getState>,
): StatConfig {
  switch (role) {
    case "driver": {
      const exp = answers.yearsExperience ?? "3-7";
      return {
        bigNumber: "3×",
        countUpTarget: 3,
        suffix: "×",
        headline: `Drivers with ${exp} years experience like you get matched 3× faster on average.`,
        subtext: "Based on typical matching patterns across Africa.",
        accentColor: "#2ECC71",
        accentBg: "rgba(46, 204, 113, 0.1)",
        icon: "⚡",
      };
    }
    case "owner": {
      const pain = answers.ownerPainPoint ?? "trust";
      const painLabel =
        pain === "trust"
          ? "trust & verification"
          : pain === "availability"
            ? "driver availability"
            : pain === "cost"
              ? "hiring costs"
              : "no-shows";
      return {
        bigNumber: "5",
        countUpTarget: 5,
        suffix: " hrs",
        headline: `Owners who struggle with ${painLabel} save an average of 5 hours a week once matched with verified drivers.`,
        subtext: "Based on typical matching patterns across Africa.",
        accentColor: "#FF7B54",
        accentBg: "rgba(255, 123, 84, 0.1)",
        icon: "🔑",
      };
    }
    case "client": {
      const occasion = answers.preferredOccasionType ?? "events";
      return {
        bigNumber: "1",
        countUpTarget: 1,
        suffix: " hr",
        headline: `Clients booking for ${occasion} get matched within the hour, on average.`,
        subtext: "Based on typical matching patterns across Africa.",
        accentColor: "#3B82F6",
        accentBg: "rgba(59, 130, 246, 0.1)",
        icon: "📍",
      };
    }
    case "corporate": {
      return {
        bigNumber: "20",
        countUpTarget: 20,
        suffix: "%",
        headline: `Organizations your size typically cut driver-sourcing costs by 20%.`,
        subtext: "Based on typical matching patterns across Africa.",
        accentColor: "#8B5CF6",
        accentBg: "rgba(139, 92, 246, 0.1)",
        icon: "🏢",
      };
    }
    default:
      return {
        bigNumber: "10×",
        countUpTarget: 10,
        suffix: "×",
        headline: `You'll get matched faster than traditional methods.`,
        subtext: "Based on typical matching patterns across Africa.",
        accentColor: "#2C3E5B",
        accentBg: "rgba(44, 62, 91, 0.08)",
        icon: "🚀",
      };
  }
}

/* ──────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────── */

export default function Bombshell() {
  const role = useRoleStore((s) => s.role);
  const answers = useOnboardingAnswersStore();

  const stat = useMemo(() => buildStat(role, answers), [role, answers]);

  // Animated count-up number
  const [displayNum, setDisplayNum] = useState(0);
  const countAnim = useMemo(() => new Animated.Value(0), []);

  // Staggered animations
  const iconOpacity = useMemo(() => new Animated.Value(0), []);
  const iconScale = useMemo(() => new Animated.Value(0.5), []);
  const cardOpacity = useMemo(() => new Animated.Value(0), []);
  const cardScale = useMemo(() => new Animated.Value(0.9), []);
  const headlineOpacity = useMemo(() => new Animated.Value(0), []);
  const headlineY = useMemo(() => new Animated.Value(15), []);
  const subtextOpacity = useMemo(() => new Animated.Value(0), []);
  const subtextY = useMemo(() => new Animated.Value(10), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const footerY = useMemo(() => new Animated.Value(20), []);

  useFocusEffect(
    useCallback(() => {
      // Reset all
      iconOpacity.setValue(0);
      iconScale.setValue(0.5);
      cardOpacity.setValue(0);
      cardScale.setValue(0.9);
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      subtextOpacity.setValue(0);
      subtextY.setValue(10);
      footerOpacity.setValue(0);
      footerY.setValue(20);
      countAnim.setValue(0);
      setDisplayNum(0);

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

        // 2. Stat card scales up — 350ms
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
              toValue: 1,
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 3. Count-up number — starts with card
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(countAnim, {
            toValue: stat.countUpTarget,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),

        // 4. Headline — 800ms
        Animated.sequence([
          Animated.delay(800),
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

        // 5. Subtext — 1000ms
        Animated.sequence([
          Animated.delay(1000),
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

        // 6. Footer — 1200ms
        Animated.sequence([
          Animated.delay(1200),
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
      cardOpacity,
      cardScale,
      headlineOpacity,
      headlineY,
      subtextOpacity,
      subtextY,
      footerOpacity,
      footerY,
      countAnim,
      stat.countUpTarget,
    ]),
  );

  // Count-up listener
  useEffect(() => {
    const listener = countAnim.addListener(({ value }) => {
      setDisplayNum(Math.round(value));
    });
    return () => countAnim.removeListener(listener);
  }, [countAnim]);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useOnboardingAnswersStore.getState().setLastCompletedScreen("bombshell");
    router.push("/(onboarding)/closing-reflection" as Href);
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
            <PageDots total={7} current={6} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content ── */}
        <View style={styles.body}>
          {/* Icon — bounces in */}
          <Animated.View
            style={[
              styles.iconWrap,
              {
                backgroundColor: stat.accentBg,
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <Text style={styles.iconEmoji}>{stat.icon}</Text>
          </Animated.View>

          {/* Stat card — scales up */}
          <Animated.View
            style={[
              styles.statCard,
              { opacity: cardOpacity, transform: [{ scale: cardScale }] },
            ]}
          >
            <Text style={[styles.bigNumber, { color: stat.accentColor }]}>
              {displayNum}
              {stat.suffix}
            </Text>
          </Animated.View>

          {/* Headline — fade + slide */}
          <Animated.Text
            style={[
              styles.headline,
              {
                opacity: headlineOpacity,
                transform: [{ translateY: headlineY }],
              },
            ]}
          >
            {stat.headline}
          </Animated.Text>

          {/* Subtext — fade + slide */}
          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: subtextOpacity,
                transform: [{ translateY: subtextY }],
              },
            ]}
          >
            {stat.subtext}
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

/* ──────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────── */

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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 36,
  },
  statCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 23, 42, 0.1)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 8,
    marginBottom: 28,
  },
  bigNumber: {
    fontSize: 72,
    fontWeight: "800",
    letterSpacing: -2,
  },
  headline: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 13,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  footer: {
    gap: 12,
  },
});
