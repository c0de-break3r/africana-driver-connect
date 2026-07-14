import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  OnboardingOptionRow,
  PageDots,
  PrimaryButton,
  ScreenContainer,
} from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Foundational questions — Act 1, Step 6.
 * Role-branched, 2 short questions each.
 *
 * Choice questions use the shared onboarding option-row layout:
 * headline / centered hint / option list with dividers / disabled CTA until selected.
 */

/* ──────────────────────────────────────────────
 * Question definitions per role
 * ────────────────────────────────────────────── */

type ChoiceOption = { label: string; value: string };

const DRIVER_EXPERIENCE_OPTIONS: ChoiceOption[] = [
  { label: "Less than 1 year", value: "<1" },
  { label: "1–3 years", value: "1-3" },
  { label: "3–7 years", value: "3-7" },
  { label: "More than 7 years", value: "7+" },
];

const EMPLOYMENT_OPTIONS: ChoiceOption[] = [
  { label: "Currently employed", value: "employed" },
  { label: "Looking for work", value: "looking" },
  { label: "Open to offers", value: "open" },
];

const OWNER_PAIN_OPTIONS: ChoiceOption[] = [
  { label: "Trust & verification", value: "trust" },
  { label: "Availability", value: "availability" },
  { label: "Cost", value: "cost" },
  { label: "No-shows", value: "no-shows" },
];

const OCCASION_OPTIONS: ChoiceOption[] = [
  { label: "Wedding", value: "Wedding" },
  { label: "Airport", value: "Airport" },
  { label: "Event", value: "Event" },
  { label: "Daily Commute", value: "Daily Commute" },
  { label: "Business Trip", value: "Business Trip" },
  { label: "Other", value: "Other" },
];

const FREQUENCY_OPTIONS: ChoiceOption[] = [
  { label: "Occasional", value: "occasional" },
  { label: "Regular", value: "regular" },
];

const CORPORATE_CHALLENGE_OPTIONS: ChoiceOption[] = [
  { label: "Cost", value: "cost" },
  { label: "Reliability", value: "reliability" },
  { label: "Compliance", value: "compliance" },
  { label: "Scale", value: "scale" },
];

const ORG_SIZE_OPTIONS: ChoiceOption[] = [
  { label: "1–10", value: "1-10" },
  { label: "11–50", value: "11-50" },
  { label: "51–200", value: "51-200" },
  { label: "200+", value: "200+" },
];

/* ──────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────── */

export default function FoundationalQuestions() {
  const role = useRoleStore((s) => s.role);
  const setDriverAnswers = useOnboardingAnswersStore((s) => s.setDriverAnswers);
  const setOwnerAnswers = useOnboardingAnswersStore((s) => s.setOwnerAnswers);
  const setClientAnswers = useOnboardingAnswersStore((s) => s.setClientAnswers);
  const setCorporateAnswers = useOnboardingAnswersStore(
    (s) => s.setCorporateAnswers,
  );

  // Step tracking (0 = Q1, 1 = Q2)
  const [step, setStep] = useState(0);

  // Q1 answers
  const [q1Text, setQ1Text] = useState("");
  const [q1Choice, setQ1Choice] = useState<string | null>(null);

  // Q2 answer
  const [q2Choice, setQ2Choice] = useState<string | null>(null);

  // Animations
  const contentOpacity = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(20), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const footerY = useMemo(() => new Animated.Value(20), []);

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

  /* ── Animate step transition ── */
  const animateStepTransition = () => {
    contentOpacity.setValue(0);
    contentY.setValue(20);
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
    ]).start();
  };

  /* ── Question config per role ── */
  const questions = getQuestionsForRole(role);
  const q1 = questions[0];
  const q2 = questions[1];

  /* ── Save + Continue ── */
  const handleContinue = () => {
    if (!canContinue) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (step === 0) {
      // Move to Q2
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(1);
      animateStepTransition();
      return;
    }

    // Save answers
    if (role === "driver") {
      setDriverAnswers(
        q1Choice ?? q1Text,
        (q2Choice as "employed" | "looking" | "open") ?? "open",
      );
    } else if (role === "owner") {
      setOwnerAnswers(
        q1Text,
        (q2Choice as "trust" | "availability" | "cost" | "no-shows") ?? "trust",
      );
    } else if (role === "client") {
      setClientAnswers(
        q1Choice ?? "",
        (q2Choice as "occasional" | "regular") ?? "occasional",
      );
    } else if (role === "corporate") {
      setCorporateAnswers(
        q1Choice ?? q1Text,
        (q2Choice as "cost" | "reliability" | "compliance" | "scale") ?? "cost",
      );
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useOnboardingAnswersStore
      .getState()
      .setLastCompletedScreen("foundational-questions");
    router.push("/(onboarding)/bombshell" as Href);
  };

  /* ── Validate current step ── */
  const canContinue =
    step === 0
      ? q1.inputType === "text"
        ? q1Text.trim().length > 0
        : q1Choice !== null
      : q2Choice !== null;

  const currentQ = step === 0 ? q1 : q2;
  const currentChoices = step === 0 ? q1.options : q2.options;
  const currentSelected = step === 0 ? q1Choice : q2Choice;
  const setCurrentSelected = step === 0 ? setQ1Choice : setQ2Choice;

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              if (step === 1) {
                setStep(0);
                animateStepTransition();
              } else {
                router.back();
              }
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={2} current={step} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Question content ── */}
        <Animated.View
          style={[
            styles.body,
            { opacity: contentOpacity, transform: [{ translateY: contentY }] },
          ]}
        >
          <Text style={styles.headline}>{currentQ.question}</Text>
          <Text style={styles.subtext}>{currentQ.hint}</Text>

          {/* Text input (for Q1 when applicable) */}
          {currentQ.inputType === "text" && (
            <TextInput
              value={step === 0 ? q1Text : ""}
              onChangeText={step === 0 ? setQ1Text : () => {}}
              placeholder={currentQ.placeholder}
              placeholderTextColor="#B0BEC5"
              style={styles.textInput}
              keyboardType={
                currentQ.keyboard === "number" ? "number-pad" : "default"
              }
              maxLength={20}
            />
          )}

          {/* Choice list */}
          {currentChoices && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsContent}
            >
              {currentChoices.map((opt, index) => (
                <OnboardingOptionRow
                  key={opt.value}
                  title={opt.label}
                  selected={currentSelected === opt.value}
                  isLast={index === currentChoices.length - 1}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCurrentSelected(opt.value);
                  }}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: footerOpacity, transform: [{ translateY: footerY }] },
          ]}
        >
          <PrimaryButton
            title={step === 0 ? "Next" : "Continue"}
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
 * Question config helper
 * ────────────────────────────────────────────── */

type QuestionConfig = {
  question: string;
  hint: string;
  inputType: "text" | "choices";
  placeholder?: string;
  keyboard?: "number";
  options?: ChoiceOption[];
};

function getQuestionsForRole(
  role: string | null,
): [QuestionConfig, QuestionConfig] {
  switch (role) {
    case "driver":
      return [
        {
          question: "How many years of driving experience do you have?",
          hint: "This helps us match you with opportunities that fit your experience.",
          inputType: "choices",
          options: DRIVER_EXPERIENCE_OPTIONS,
        },
        {
          question: "What's your current employment status?",
          hint: "We'll tailor the opportunities we show you.",
          inputType: "choices",
          options: EMPLOYMENT_OPTIONS,
        },
      ];
    case "owner":
      return [
        {
          question: "How many vehicles do you own?",
          hint: "This helps us understand your fleet capacity.",
          inputType: "text",
          placeholder: "e.g. 3",
          keyboard: "number",
        },
        {
          question: "What's your biggest pain point when hiring drivers?",
          hint: "We'll address this first in your experience.",
          inputType: "choices",
          options: OWNER_PAIN_OPTIONS,
        },
      ];
    case "client":
      return [
        {
          question: "What type of occasion do you need a driver for?",
          hint: "We'll match you with drivers who specialize in this.",
          inputType: "choices",
          options: OCCASION_OPTIONS,
        },
        {
          question: "How often do you book a driver?",
          hint: "This helps us recommend the right plans.",
          inputType: "choices",
          options: FREQUENCY_OPTIONS,
        },
      ];
    case "corporate":
      return [
        {
          question: "What's your organization size?",
          hint: "This determines the scale of solutions we offer.",
          inputType: "choices",
          options: ORG_SIZE_OPTIONS,
        },
        {
          question: "What's your biggest outsourcing challenge?",
          hint: "We'll prioritize solving this for your organization.",
          inputType: "choices",
          options: CORPORATE_CHALLENGE_OPTIONS,
        },
      ];
    default:
      return [
        {
          question: "Tell us about yourself",
          hint: "We'll personalize your experience.",
          inputType: "text",
          placeholder: "Your answer...",
        },
        {
          question: "What do you need most?",
          hint: "We'll start here.",
          inputType: "choices",
          options: [
            { label: "Finding work", value: "work" },
            { label: "Hiring help", value: "hire" },
          ],
        },
      ];
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
  textInput: {
    width: "100%",
    fontSize: 18,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: "left",
    shadowColor: "rgba(15, 23, 42, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  optionsList: {
    width: "100%",
  },
  optionsContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  footer: {
    gap: 12,
  },
});
