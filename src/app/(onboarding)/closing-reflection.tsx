import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    FadeInText,
    OnboardingOptionRow,
    PageDots,
    PrimaryButton,
    ScreenContainer,
} from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Closing reflection — Act 1, Step 10.
 * Closes the entire onboarding act.
 *
 * Three phases:
 * 1. Two short analytics questions ("How did you hear about us?",
 *    "What's your biggest goal this month?")
 * 2. Brief reflection mirroring those answers back
 * 3. Final closing screen with a mock bar chart + confirming stat
 *
 * Routes to (auth)/sign-in when done.
 *
 * Design reference: onboarding17–20.jpg (question cards + chart pattern).
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type ChoiceOption = { label: string; value: string; icon?: string };

type ClosingQuestion = {
  id: string;
  question: string;
  hint: string;
  options: ChoiceOption[];
};

/* ──────────────────────────────────────────────
 * Question definitions
 * ────────────────────────────────────────────── */

const QUESTION_HEAR: ClosingQuestion = {
  id: "closing_hear_about",
  question: "How did you hear about us?",
  hint: "This helps us know where to reach more people like you.",
  options: [
    { label: "Social media", value: "social_media", icon: "📱" },
    { label: "A friend or colleague", value: "friend", icon: "🤝" },
    { label: "Online search", value: "search", icon: "🔍" },
    { label: "Saw an ad", value: "ad", icon: "📢" },
    { label: "Just found you!", value: "other", icon: "✨" },
  ],
};

const GOAL_OPTIONS_BY_ROLE: Record<string, ChoiceOption[]> = {
  driver: [
    { label: "Land my first verified gig", value: "first_gig", icon: "🚗" },
    { label: "Earn more consistently", value: "earn_more", icon: "💰" },
    { label: "Build a strong reputation", value: "reputation", icon: "⭐" },
    { label: "Find long-term work", value: "long_term", icon: "📋" },
  ],
  owner: [
    { label: "Hire a trusted driver", value: "hire_trusted", icon: "🔑" },
    { label: "Get my vehicles on the road", value: "on_road", icon: "🚛" },
    { label: "Reduce driver no-shows", value: "reduce_noshow", icon: "✅" },
    { label: "Grow my fleet", value: "grow_fleet", icon: "📈" },
  ],
  client: [
    { label: "Book reliable transport", value: "book_reliable", icon: "📍" },
    { label: "Find a driver for an event", value: "event_driver", icon: "🎉" },
    { label: "Stop worrying about safety", value: "safety", icon: "🛡️" },
    { label: "Simplify my daily commute", value: "commute", icon: "🏠" },
  ],
  corporate: [
    { label: "Outsource fleet management", value: "fleet", icon: "🏢" },
    { label: "Cut transport costs", value: "cut_costs", icon: "💼" },
    { label: "Ensure compliance", value: "compliance", icon: "📄" },
    { label: "Scale driver operations", value: "scale", icon: "📊" },
  ],
};

function getGoalQuestion(role: string | null): ClosingQuestion {
  const options =
    GOAL_OPTIONS_BY_ROLE[role ?? "driver"] ?? GOAL_OPTIONS_BY_ROLE.driver;
  return {
    id: "closing_biggest_goal",
    question: "What's your biggest goal this month?",
    hint: "We'll make sure your dashboard is built around this.",
    options,
  };
}

/* ──────────────────────────────────────────────
 * Mock chart data
 * ────────────────────────────────────────────── */

const CHART_DATA = [
  { label: "Others", value: 72, color: "#E8ECF0" },
  { label: "Others", value: 48, color: "#D1D9E0" },
  { label: "Others", value: 36, color: "#B8C5CE" },
  { label: "ADC", value: 12, color: "#2C3E5B" },
];

/* ──────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────── */

/**
 * Phase: "questions" → asking analytics questions (2 steps)
 *        "reflection" → mirror answers back
 *        "closing" → chart + confirming stat + CTA to auth screen
 */
type Phase = "questions" | "reflection" | "closing";

export default function ClosingReflection() {
  const role = useRoleStore((s) => s.role);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const goalQuestion = useMemo(() => getGoalQuestion(role), [role]);
  const questions = useMemo(
    () => [QUESTION_HEAR, goalQuestion],
    [goalQuestion],
  );

  const [phase, setPhase] = useState<Phase>("questions");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // Animations
  const contentOpacity = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(20), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const footerY = useMemo(() => new Animated.Value(20), []);
  // Chart bar animations
  const bar1Height = useMemo(() => new Animated.Value(0), []);
  const bar2Height = useMemo(() => new Animated.Value(0), []);
  const bar3Height = useMemo(() => new Animated.Value(0), []);
  const bar4Height = useMemo(() => new Animated.Value(0), []);
  const chartLabelOpacity = useMemo(() => new Animated.Value(0), []);

  useFocusEffect(
    useCallback(() => {
      // Reset
      contentOpacity.setValue(0);
      contentY.setValue(20);
      footerOpacity.setValue(0);
      footerY.setValue(20);
      bar1Height.setValue(0);
      bar2Height.setValue(0);
      bar3Height.setValue(0);
      bar4Height.setValue(0);
      chartLabelOpacity.setValue(0);

      Animated.parallel([
        // Content cascade
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(contentY, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Footer
        Animated.sequence([
          Animated.delay(350),
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
        // Chart bars (only animate in closing phase)
        ...(phase === "closing"
          ? [
              Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                  Animated.spring(bar1Height, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: false,
                  }),
                  Animated.sequence([
                    Animated.delay(100),
                    Animated.spring(bar2Height, {
                      toValue: 1,
                      tension: 50,
                      friction: 8,
                      useNativeDriver: false,
                    }),
                  ]),
                  Animated.sequence([
                    Animated.delay(200),
                    Animated.spring(bar3Height, {
                      toValue: 1,
                      tension: 50,
                      friction: 8,
                      useNativeDriver: false,
                    }),
                  ]),
                  Animated.sequence([
                    Animated.delay(350),
                    Animated.spring(bar4Height, {
                      toValue: 1,
                      tension: 50,
                      friction: 8,
                      useNativeDriver: false,
                    }),
                  ]),
                ]),
              ]),
              Animated.sequence([
                Animated.delay(900),
                Animated.timing(chartLabelOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ]),
            ]
          : []),
      ]).start();
    }, [
      contentOpacity,
      contentY,
      footerOpacity,
      footerY,
      bar1Height,
      bar2Height,
      bar3Height,
      bar4Height,
      chartLabelOpacity,
      phase,
    ]),
  );

  /** Smooth transition between phases/steps. */
  const animateTransition = () => {
    contentOpacity.setValue(0);
    contentY.setValue(20);
    footerOpacity.setValue(0);
    footerY.setValue(20);
    bar1Height.setValue(0);
    bar2Height.setValue(0);
    bar3Height.setValue(0);
    bar4Height.setValue(0);
    chartLabelOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(footerY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Chart bars
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.spring(bar1Height, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.delay(100),
            Animated.spring(bar2Height, {
              toValue: 1,
              tension: 50,
              friction: 8,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.spring(bar3Height, {
              toValue: 1,
              tension: 50,
              friction: 8,
              useNativeDriver: false,
            }),
          ]),
          Animated.sequence([
            Animated.delay(350),
            Animated.spring(bar4Height, {
              toValue: 1,
              tension: 50,
              friction: 8,
              useNativeDriver: false,
            }),
          ]),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(chartLabelOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  /* ── Current question ── */
  const currentQ = questions[qIndex];

  /* ── Reflection lines ── */
  const reflectionLines = useMemo(() => {
    const hearAnswer = answers["closing_hear_about"];
    const goalAnswer = answers["closing_biggest_goal"];

    const hearOpt = QUESTION_HEAR.options.find((o) => o.value === hearAnswer);
    const goalOpt = goalQuestion.options.find((o) => o.value === goalAnswer);

    const lines: string[] = [];
    if (hearOpt)
      lines.push(`You found us through ${hearOpt.label.toLowerCase()}`);
    if (goalOpt) lines.push(`Your top goal: ${goalOpt.label}`);
    return lines;
  }, [answers, goalQuestion]);

  /* ── Handlers ── */
  const handleSelectOption = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(value);
  };

  const handleContinue = () => {
    if (phase === "questions" && selected) {
      // Save answer
      setAnswers((prev) => ({ ...prev, [currentQ.id]: selected }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (qIndex < questions.length - 1) {
        // Next question
        setQIndex(qIndex + 1);
        setSelected(null);
        animateTransition();
      } else {
        // Show reflection
        setPhase("reflection");
        setSelected(null);
        animateTransition();
      }
      return;
    }

    if (phase === "reflection") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhase("closing");
      animateTransition();
      return;
    }

    if (phase === "closing") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useOnboardingAnswersStore
        .getState()
        .setLastCompletedScreen("closing-reflection");
      router.push("/(auth)/sign-in" as Href);
    }
  };

  const handleBack = () => {
    if (phase === "reflection") {
      setPhase("questions");
      setQIndex(questions.length - 1);
      const prev = answers[questions[questions.length - 1].id];
      setSelected(prev ?? null);
      animateTransition();
      return;
    }
    if (phase === "questions" && qIndex > 0) {
      setQIndex(qIndex - 1);
      const prev = answers[questions[qIndex - 1].id];
      setSelected(prev ?? null);
      animateTransition();
      return;
    }
    router.back();
  };

  /* ── Can continue? ── */
  const canContinue = phase !== "questions" || selected !== null;

  /* ── Button label ── */
  const buttonLabel =
    phase === "closing"
      ? "Continue"
      : phase === "reflection"
        ? "See Your Results"
        : "Next";

  /* ── PageDots total & current ── */
  const totalSteps = questions.length + 2; // questions + reflection + closing
  const currentStep =
    phase === "questions"
      ? qIndex
      : phase === "reflection"
        ? questions.length
        : questions.length + 1;

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={totalSteps} current={currentStep} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content ── */}
        {phase === "closing" ? (
          <ClosingPhase
            contentOpacity={contentOpacity}
            contentY={contentY}
            bar1Height={bar1Height}
            bar2Height={bar2Height}
            bar3Height={bar3Height}
            bar4Height={bar4Height}
            chartLabelOpacity={chartLabelOpacity}
          />
        ) : phase === "reflection" ? (
          <ReflectionPhase
            lines={reflectionLines}
            contentOpacity={contentOpacity}
            contentY={contentY}
          />
        ) : (
          <QuestionsPhase
            contentOpacity={contentOpacity}
            contentY={contentY}
            question={currentQ}
            selected={selected}
            onSelect={handleSelectOption}
          />
        )}

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: footerOpacity, transform: [{ translateY: footerY }] },
          ]}
        >
          <PrimaryButton
            title={buttonLabel}
            onPress={handleContinue}
            disabled={!canContinue}
            style={{ width: "100%" }}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

/* ──────────────────────────────────────────────
 * Phase sub-components
 * ────────────────────────────────────────────── */

function QuestionsPhase({
  contentOpacity,
  contentY,
  question,
  selected,
  onSelect,
}: {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  question: ClosingQuestion;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <Animated.View
      style={[
        styles.questionBody,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <Text style={styles.headline}>{question.question}</Text>
      <Text style={styles.subtext}>{question.hint}</Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.optionsList}
        contentContainerStyle={styles.optionsContent}
      >
        {question.options.map((opt, index) => (
          <OnboardingOptionRow
            key={opt.value}
            icon={opt.icon}
            title={opt.label}
            selected={selected === opt.value}
            isLast={index === question.options.length - 1}
            onPress={() => onSelect(opt.value)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function ReflectionPhase({
  lines,
  contentOpacity,
  contentY,
}: {
  lines: string[];
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
}) {
  return (
    <Animated.View
      style={[
        styles.body,
        styles.reflectionBody,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <View style={styles.reflectIconWrap}>
        <Text style={styles.reflectIcon}>🎯</Text>
      </View>
      <Text style={styles.reflectHeadline}>We see you.</Text>
      <Text style={styles.reflectSubtext}>
        Your answers help us build an experience that&apos;s uniquely yours.
      </Text>
      <View style={styles.reflectCard}>
        <FadeInText
          lines={lines}
          staggerMs={500}
          durationMs={500}
          className="text-sm text-[#2C3E5B] font-medium"
        />
      </View>
    </Animated.View>
  );
}

function ClosingPhase({
  contentOpacity,
  contentY,
  bar1Height,
  bar2Height,
  bar3Height,
  bar4Height,
  chartLabelOpacity,
}: {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  bar1Height: Animated.Value;
  bar2Height: Animated.Value;
  bar3Height: Animated.Value;
  bar4Height: Animated.Value;
  chartLabelOpacity: Animated.Value;
}) {
  const barHeights = [bar1Height, bar2Height, bar3Height, bar4Height];
  const maxBarValue = Math.max(...CHART_DATA.map((d) => d.value));

  return (
    <Animated.View
      style={[
        styles.body,
        styles.closingBody,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <Text style={styles.closingHeadline}>
        You&apos;re in the right place.
      </Text>
      <Text style={styles.closingSubtext}>
        Here&apos;s why Africana Driver Connect works.
      </Text>

      {/* ── Chart card ── */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Average time to match (hours)</Text>

        {/* Bar chart */}
        <View style={styles.chartArea}>
          {CHART_DATA.map((bar, i) => {
            const barMaxH = 120;
            const barH = (bar.value / maxBarValue) * barMaxH;
            const isLast = i === CHART_DATA.length - 1;

            return (
              <View key={i} style={styles.barColumn}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: bar.color,
                      height: Animated.multiply(barHeights[i], barH),
                      opacity: barHeights[i],
                    },
                    isLast && styles.barHighlight,
                  ]}
                />
                <Text
                  style={[styles.barValue, isLast && styles.barValueHighlight]}
                >
                  {bar.value}h
                </Text>
              </View>
            );
          })}
        </View>

        {/* Chart labels */}
        <Animated.View
          style={[styles.chartLabels, { opacity: chartLabelOpacity }]}
        >
          <Text style={styles.chartFootnote}>
            Most platforms take 3–6 days.{" "}
            <Text style={styles.chartFootnoteBold}>
              We match you within hours.
            </Text>
          </Text>
        </Animated.View>
      </View>

      {/* ── Trust signal ── */}
      <View style={styles.trustRow}>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>✅</Text>
          <Text style={styles.trustText}>Verified drivers</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>🔒</Text>
          <Text style={styles.trustText}>Secure payments</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustIcon}>📍</Text>
          <Text style={styles.trustText}>Live tracking</Text>
        </View>
      </View>
    </Animated.View>
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
    marginTop: 16,
  },
  questionBody: {
    flex: 1,
    marginTop: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
  },
  subtext: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  optionsList: {
    width: "100%",
  },
  optionsContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  /* Reflection phase */
  reflectionBody: {
    alignItems: "center",
  },
  reflectIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(44, 62, 91, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  reflectIcon: {
    fontSize: 36,
  },
  reflectHeadline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },
  reflectSubtext: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  reflectCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    gap: 12,
  },
  /* Closing phase */
  closingBody: {
    alignItems: "center",
  },
  closingHeadline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },
  closingSubtext: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  chartCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7E91",
    marginBottom: 20,
    textAlign: "center",
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16,
    height: 150,
    marginBottom: 16,
  },
  barColumn: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  bar: {
    width: "100%",
    maxWidth: 48,
    borderRadius: 8,
  },
  barHighlight: {
    shadowColor: "rgba(44, 62, 91, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  barValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
  },
  barValueHighlight: {
    color: "#2C3E5B",
    fontWeight: "700",
    fontSize: 15,
  },
  chartLabels: {
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
    paddingTop: 16,
  },
  chartFootnote: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 21,
  },
  chartFootnoteBold: {
    fontWeight: "700",
    color: "#2C3E5B",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(44, 62, 91, 0.06)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  trustIcon: {
    fontSize: 14,
  },
  trustText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  footer: {
    gap: 12,
  },
});
