import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
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
    PageDots,
    PrimaryButton,
    ScreenContainer,
} from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Question bank — Act 1, Step 9.
 * Deep, role-specific questions (5 per role).
 * Each question is followed by a brief reflection mirroring the answer.
 * Ends with a final summary screen using FadeInText.
 *
 * Design reference: onboarding15–16.jpg (question → choice card pattern).
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

type ChoiceOption = { label: string; value: string };

type QBQuestion = {
  id: string;
  question: string;
  hint: string;
  options: ChoiceOption[];
  /** Build the reflection line from the selected answer label. */
  reflect: (name: string, answerLabel: string) => string;
};

/* ──────────────────────────────────────────────
 * Question definitions per role
 * ────────────────────────────────────────────── */

const DRIVER_QUESTIONS: QBQuestion[] = [
  {
    id: "driver_held_back",
    question: "What's held you back from getting hired so far?",
    hint: "We've heard this from hundreds of drivers. You're not alone.",
    options: [
      { label: "No verified profile", value: "no_verified" },
      { label: "No referrals or connections", value: "no_referrals" },
      { label: "Inconsistent job postings", value: "inconsistent" },
      { label: "Owners don't trust my documents", value: "distrust" },
    ],
    reflect: (name, answer) =>
      `Got it, ${name} — "${answer}" is one of the most common frustrations drivers face.`,
  },
  {
    id: "driver_matters_most",
    question: "What matters most to you in a driving job?",
    hint: "This helps us surface the right opportunities for you.",
    options: [
      { label: "Good pay", value: "pay" },
      { label: "Stability & consistency", value: "stability" },
      { label: "Flexible hours", value: "flexible" },
      { label: "Respect & fair treatment", value: "respect" },
    ],
    reflect: (name, answer) =>
      `Makes sense, ${name}. We'll prioritize roles where ${answer.toLowerCase()} comes first.`,
  },
  {
    id: "driver_find_work",
    question: "How do you currently find driving work?",
    hint: "Understanding this helps us fill the gaps.",
    options: [
      { label: "Word of mouth", value: "word_of_mouth" },
      { label: "Social media groups", value: "social_media" },
      { label: "Walking around depots", value: "depots" },
      { label: "I'm just starting out", value: "starting_out" },
    ],
    reflect: (name, answer) =>
      `Noted, ${name} — ${answer.toLowerCase()} works, but we can open up way more.`,
  },
  {
    id: "driver_type",
    question: "What kind of driving interests you most?",
    hint: "We'll match you with the right category from day one.",
    options: [
      { label: "Chauffeur / private", value: "chauffeur" },
      { label: "Delivery & logistics", value: "delivery" },
      { label: "School bus", value: "school" },
      { label: "Corporate / executive", value: "corporate" },
    ],
    reflect: (name, answer) =>
      `Perfect, ${name} — ${answer.toLowerCase()} is in high demand right now.`,
  },
  {
    id: "driver_trust",
    question: "What would make you trust a new platform?",
    hint: "We want to build this right. Your answer shapes what we prioritize.",
    options: [
      { label: "Verified job listings", value: "verified_jobs" },
      { label: "Quick onboarding", value: "quick_onboarding" },
      { label: "Direct contact with owners", value: "direct_contact" },
      { label: "Transparent pay structure", value: "transparent_pay" },
    ],
    reflect: (name, answer) =>
      `That's exactly what we're building, ${name}. ${answer} is at the core.`,
  },
];

const OWNER_QUESTIONS: QBQuestion[] = [
  {
    id: "owner_gone_wrong",
    question: "What's gone wrong with drivers you've hired before?",
    hint: "We know this is frustrating. Tell us so we can fix it.",
    options: [
      { label: "No-shows & ghosting", value: "no_shows" },
      { label: "Poor driving & accidents", value: "poor_driving" },
      { label: "Dishonesty with fuel / mileage", value: "dishonesty" },
      { label: "No valid license or documents", value: "no_docs" },
    ],
    reflect: (name, answer) =>
      `We hear you, ${name}. "${answer}" is exactly what our verification solves.`,
  },
  {
    id: "owner_need_most",
    question: "What do you need most from a driver platform?",
    hint: "This shapes how we build your experience.",
    options: [
      { label: "Fast matching", value: "fast_matching" },
      { label: "Trust & verification", value: "trust" },
      { label: "Affordable rates", value: "affordable" },
      { label: "Drivers available around the clock", value: "availability" },
    ],
    reflect: (name, answer) =>
      `Understood, ${name}. We'll make sure ${answer.toLowerCase()} is front and center.`,
  },
  {
    id: "owner_verify",
    question: "How do you currently verify a driver before hiring?",
    hint: "Most owners struggle with this. We want to make it effortless.",
    options: [
      { label: "Ask for references", value: "references" },
      { label: "Check documents myself", value: "check_self" },
      { label: "Trial period first", value: "trial" },
      { label: "I don't — it's too hard", value: "skip" },
    ],
    reflect: (name, answer) =>
      `That's common, ${name}. Our platform handles the heavy lifting of verification.`,
  },
  {
    id: "owner_vehicle_type",
    question: "What type of vehicle do you need drivers for?",
    hint: "This helps us match you with drivers experienced in the right category.",
    options: [
      { label: "Private car", value: "private_car" },
      { label: "Commercial truck", value: "truck" },
      { label: "Bus or minibus", value: "bus" },
      { label: "Heavy equipment", value: "heavy" },
    ],
    reflect: (name, answer) =>
      `Got it, ${name} — we have drivers experienced with ${answer.toLowerCase()}.`,
  },
  {
    id: "owner_urgency",
    question: "How urgent is your need right now?",
    hint: "We'll prioritize accordingly.",
    options: [
      { label: "Need someone this week", value: "this_week" },
      { label: "Looking casually", value: "casual" },
      { label: "Building a fleet", value: "fleet" },
      { label: "Just exploring options", value: "exploring" },
    ],
    reflect: (name, answer) =>
      `Noted, ${name}. We'll tailor the pace to match "${answer.toLowerCase()}."`,
  },
];

const CLIENT_QUESTIONS: QBQuestion[] = [
  {
    id: "client_stress",
    question: "What's stressed you out about booking transport before?",
    hint: "We've all been there. Your answer helps us prevent that.",
    options: [
      { label: "Unreliable drivers", value: "unreliable" },
      { label: "Unclear pricing", value: "unclear_pricing" },
      { label: "Safety concerns", value: "safety" },
      { label: "No tracking or updates", value: "no_tracking" },
    ],
    reflect: (name, answer) =>
      `We've got you, ${name}. ${answer} is something we take seriously.`,
  },
  {
    id: "client_occasion",
    question: "What kind of occasion do you usually book for?",
    hint: "This helps us recommend drivers who specialize in your needs.",
    options: [
      { label: "Weddings & events", value: "weddings" },
      { label: "Airport transfers", value: "airport" },
      { label: "Daily commute", value: "commute" },
      { label: "Business trips", value: "business" },
    ],
    reflect: (name, answer) =>
      `Perfect, ${name} — we have great drivers for ${answer.toLowerCase()}.`,
  },
  {
    id: "client_find_driver",
    question: "How do you usually find a driver when you need one?",
    hint: "We want to be your go-to. Tell us what you do now.",
    options: [
      { label: "Ask friends or family", value: "ask_friends" },
      { label: "Use ride-hailing apps", value: "apps" },
      { label: "Call a taxi company", value: "taxi" },
      { label: "I drive myself", value: "self_drive" },
    ],
    reflect: (name, answer) =>
      `Fair enough, ${name}. We think you'll find this refreshingly different.`,
  },
  {
    id: "client_priority",
    question: "What's most important when booking a ride?",
    hint: "We'll optimize your experience around this.",
    options: [
      { label: "Safety & trust", value: "safety" },
      { label: "Price", value: "price" },
      { label: "Convenience", value: "convenience" },
      { label: "Vehicle quality", value: "vehicle_quality" },
    ],
    reflect: (name, answer) =>
      `Understood, ${name}. ${answer} will always come first in your matches.`,
  },
  {
    id: "client_frequency",
    question: "How often would you use a trusted driver service?",
    hint: "This helps us recommend the right plan for you.",
    options: [
      { label: "Weekly", value: "weekly" },
      { label: "Monthly", value: "monthly" },
      { label: "Special occasions only", value: "occasions" },
      { label: "Whenever I travel", value: "travel" },
    ],
    reflect: (name, answer) =>
      `Great, ${name} — we have options tailored for ${answer.toLowerCase()} usage.`,
  },
];

const CORPORATE_QUESTIONS: QBQuestion[] = [
  {
    id: "corp_risk",
    question: "What's the biggest risk in your current transport setup?",
    hint: "We help organizations address exactly this.",
    options: [
      { label: "Compliance & legal issues", value: "compliance" },
      { label: "Cost overruns", value: "cost" },
      { label: "Driver turnover", value: "turnover" },
      { label: "No accountability", value: "no_accountability" },
    ],
    reflect: (name, answer) =>
      `That's a real concern, ${name}. We've built our corporate tools around solving ${answer.toLowerCase()}.`,
  },
  {
    id: "corp_headache",
    question: "What's your biggest headache managing drivers?",
    hint: "Your answer shapes the dashboard we build for you.",
    options: [
      { label: "Scheduling conflicts", value: "scheduling" },
      { label: "Tracking & monitoring", value: "tracking" },
      { label: "Payroll & contracts", value: "payroll" },
      { label: "Finding qualified drivers", value: "finding" },
    ],
    reflect: (name, answer) =>
      `We understand, ${name}. Our platform automates ${answer.toLowerCase()} so you don't have to.`,
  },
  {
    id: "corp_industry",
    question: "What industry is your organization in?",
    hint: "This helps us connect you with drivers who know your sector.",
    options: [
      { label: "Logistics & delivery", value: "logistics" },
      { label: "Staff transportation", value: "staff_transport" },
      { label: "Construction & mining", value: "construction" },
      { label: "Corporate / executive", value: "corporate" },
    ],
    reflect: (name, answer) =>
      `Excellent, ${name} — we work with organizations in ${answer.toLowerCase()} regularly.`,
  },
  {
    id: "corp_scale",
    question: "How many drivers does your organization typically need?",
    hint: "We'll size the solution to match.",
    options: [
      { label: "1–5 drivers", value: "1-5" },
      { label: "6–20 drivers", value: "6-20" },
      { label: "21–50 drivers", value: "21-50" },
      { label: "50+ drivers", value: "50+" },
    ],
    reflect: (name, answer) =>
      `Got it, ${name}. We can comfortably support ${answer.toLowerCase()} at scale.`,
  },
  {
    id: "corp_switch",
    question: "What would make you switch to a new transport partner?",
    hint: "We want to earn your trust. Tell us what it takes.",
    options: [
      { label: "Better pricing", value: "pricing" },
      { label: "More reliability", value: "reliability" },
      { label: "Compliance support", value: "compliance_support" },
      { label: "Scalability", value: "scalability" },
    ],
    reflect: (name, answer) =>
      `That's fair, ${name}. ${answer} is one of our strongest areas.`,
  },
];

/* ──────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────── */

export default function QuestionBank() {
  const role = useRoleStore((s) => s.role);
  const firstName = useOnboardingAnswersStore((s) => s.firstName) ?? "there";
  const setQuestionBankAnswer = useOnboardingAnswersStore(
    (s) => s.setQuestionBankAnswer,
  );
  const allAnswers = useOnboardingAnswersStore((s) => s.questionBankAnswers);

  const questions = useMemo(() => getQuestionsForRole(role), [role]);

  /**
   * Phase: "asking" = show question + choices.
   *        "reflecting" = show brief mirror of answer.
   *        "summary" = final FadeInText summary of all answers.
   */
  const [phase, setPhase] = useState<"asking" | "reflecting" | "summary">(
    "asking",
  );
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  // Animations
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      contentOpacity.setValue(0);
      contentY.setValue(20);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
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
      ]).start();
    }, [contentOpacity, contentY, footerOpacity, footerY]),
  );

  /** Animate transition between phases/steps. */
  const animateTransition = () => {
    contentOpacity.setValue(0);
    contentY.setValue(20);
    footerOpacity.setValue(0);
    footerY.setValue(20);

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
    ]).start();
  };

  /* ── Current question ── */
  const currentQ = questions[qIndex];
  const selectedOption = currentQ?.options.find((o) => o.value === selected);

  /* ── Reflection text ── */
  const reflectionText =
    selectedOption && currentQ
      ? currentQ.reflect(firstName, selectedOption.label)
      : "";

  /* ── Summary lines for final screen ── */
  const summaryLines = useMemo(() => {
    return questions
      .map((q) => {
        const answer = allAnswers[q.id];
        if (!answer) return null;
        const opt = q.options.find((o) => o.value === answer);
        return opt ? `• ${opt.label}` : null;
      })
      .filter(Boolean) as string[];
  }, [questions, allAnswers]);

  /* ── Handlers ── */
  const handleSelectOption = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(value);
  };

  const handleContinue = () => {
    if (phase === "asking" && selected) {
      // Save answer, show reflection
      setQuestionBankAnswer(currentQ.id, selected);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPhase("reflecting");
      setSelected(null);
      animateTransition();
      return;
    }

    if (phase === "reflecting") {
      // Next question or summary
      if (qIndex < questions.length - 1) {
        setQIndex(qIndex + 1);
        setPhase("asking");
        animateTransition();
      } else {
        // All done — show summary
        setPhase("summary");
        animateTransition();
      }
      return;
    }

    if (phase === "summary") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useOnboardingAnswersStore
        .getState()
        .setLastCompletedScreen("question-bank");
      router.push("/(onboarding)/closing-reflection" as Href);
    }
  };

  const handleBack = () => {
    if (phase === "reflecting") {
      setPhase("asking");
      // Restore the selected answer so user can change it
      const prev = allAnswers[currentQ.id];
      setSelected(prev ?? null);
      animateTransition();
      return;
    }
    if (phase === "asking" && qIndex > 0) {
      setQIndex(qIndex - 1);
      setPhase("reflecting");
      animateTransition();
      return;
    }
    router.back();
  };

  /* ── Can continue? ── */
  const canContinue =
    phase === "summary" || phase === "reflecting" || selected !== null;

  /* ── Button label ── */
  const buttonLabel =
    phase === "summary"
      ? "Continue"
      : phase === "reflecting"
        ? qIndex < questions.length - 1
          ? "Next Question"
          : "See Your Summary"
        : "Next";

  /* ── Total steps for PageDots ── */
  const totalSteps = questions.length;

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots
              total={totalSteps}
              current={Math.min(qIndex, totalSteps - 1)}
            />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content ── */}
        {phase === "summary" ? (
          <SummaryPhase
            firstName={firstName}
            lines={summaryLines}
            contentOpacity={contentOpacity}
            contentY={contentY}
          />
        ) : phase === "reflecting" ? (
          <ReflectingPhase
            contentOpacity={contentOpacity}
            contentY={contentY}
            reflectionText={reflectionText}
          />
        ) : (
          <AskingPhase
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

function AskingPhase({
  contentOpacity,
  contentY,
  question,
  selected,
  onSelect,
}: {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  question: QBQuestion;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <Animated.View
      style={[
        styles.body,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <Text style={styles.headline}>{question.question}</Text>
      <Text style={styles.subtext}>{question.hint}</Text>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.choicesList}>
          {question.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <Pressable key={opt.value} onPress={() => onSelect(opt.value)}>
                <View
                  style={[
                    styles.choiceCard,
                    isSelected ? styles.choiceSelected : styles.choiceDefault,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.checkDot}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.choiceText,
                      isSelected && styles.choiceTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function ReflectingPhase({
  contentOpacity,
  contentY,
  reflectionText,
}: {
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
  reflectionText: string;
}) {
  return (
    <Animated.View
      style={[
        styles.body,
        styles.reflectingBody,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <View style={styles.reflectIconWrap}>
        <Text style={styles.reflectIcon}>💬</Text>
      </View>
      <Text style={styles.reflectText}>{reflectionText}</Text>
    </Animated.View>
  );
}

function SummaryPhase({
  firstName,
  lines,
  contentOpacity,
  contentY,
}: {
  firstName: string;
  lines: string[];
  contentOpacity: Animated.Value;
  contentY: Animated.Value;
}) {
  return (
    <Animated.View
      style={[
        styles.body,
        styles.summaryBody,
        { opacity: contentOpacity, transform: [{ translateY: contentY }] },
      ]}
    >
      <Text style={styles.summaryHeadline}>
        Here&apos;s what we learned, {firstName}.
      </Text>
      <Text style={styles.summarySubtext}>
        Your personalized experience is built on these answers.
      </Text>
      <View style={styles.summaryCard}>
        <FadeInText
          lines={lines}
          staggerMs={400}
          durationMs={500}
          className="text-sm text-[#2C3E5B] font-medium"
        />
      </View>
    </Animated.View>
  );
}

/* ──────────────────────────────────────────────
 * Role routing
 * ────────────────────────────────────────────── */

function getQuestionsForRole(role: string | null): QBQuestion[] {
  switch (role) {
    case "driver":
      return DRIVER_QUESTIONS;
    case "owner":
      return OWNER_QUESTIONS;
    case "client":
      return CLIENT_QUESTIONS;
    case "corporate":
      return CORPORATE_QUESTIONS;
    default:
      return DRIVER_QUESTIONS;
  }
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
  headline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    lineHeight: 34,
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: "#6E7E91",
    lineHeight: 22,
    marginBottom: 24,
  },
  choicesList: {
    gap: 12,
  },
  choiceCard: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(15, 23, 42, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  choiceSelected: {
    borderWidth: 2,
    borderColor: "#2C3E5B",
    shadowColor: "rgba(44, 62, 91, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  choiceDefault: {
    borderWidth: 1,
    borderColor: "#E8ECF0",
  },
  checkDot: {
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
  checkMark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  choiceText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 22,
  },
  choiceTextSelected: {
    color: "#2C3E5B",
    fontWeight: "600",
  },
  /* Reflecting phase */
  reflectingBody: {
    alignItems: "center",
    justifyContent: "center",
  },
  reflectIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(44, 62, 91, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  reflectIcon: {
    fontSize: 36,
  },
  reflectText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 32,
    paddingHorizontal: 16,
  },
  /* Summary phase */
  summaryBody: {
    alignItems: "center",
  },
  summaryHeadline: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  summaryCard: {
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
  footer: {
    gap: 12,
  },
});
