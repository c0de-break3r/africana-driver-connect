import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";

/**
 * Name screen — Act 1, Step 4.
 * Simple input asking for the user's first name.
 * Stored in useOnboardingAnswersStore and reused in later headlines.
 *
 * Layout reference: matches problem.tsx / solution.tsx pattern.
 */
export default function Name() {
  const [value, setValue] = useState("");
  const setFirstName = useOnboardingAnswersStore((s) => s.setFirstName);
  const inputRef = useRef<TextInput>(null);

  // Keyboard state
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Staggered animations
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(20)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputY = useRef(new Animated.Value(15)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  // Animated values for keyboard shift
  const contentShiftY = useRef(new Animated.Value(0)).current;

  // Keyboard show/hide — shift content up, shrink card
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(cardScale, {
            toValue: 0.6,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(contentShiftY, {
            toValue: -40,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            tension: 80,
            friction: 12,
            useNativeDriver: true,
          }),
          Animated.timing(contentShiftY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [cardOpacity, cardScale, contentShiftY]);

  useFocusEffect(
    useCallback(() => {
      cardOpacity.setValue(0);
      cardY.setValue(20);
      cardScale.setValue(1);
      inputOpacity.setValue(0);
      inputY.setValue(15);
      hintOpacity.setValue(0);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        // Card fades in + slides up — 100ms
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

        // Input slides in — 400ms
        Animated.sequence([
          Animated.delay(400),
          Animated.parallel([
            Animated.timing(inputOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(inputY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Hint fades in — 550ms
        Animated.sequence([
          Animated.delay(550),
          Animated.timing(hintOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),

        // Footer slides in — 700ms
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
      ]).start(() => {
        // Auto-focus the input after animations finish
        inputRef.current?.focus();
      });
    }, [
      cardOpacity,
      cardY,
      cardScale,
      inputOpacity,
      inputY,
      hintOpacity,
      footerOpacity,
      footerY,
    ]),
  );

  const trimmed = value.trim();

  const handleContinue = () => {
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFirstName(trimmed);
    router.push("/(onboarding)/role-question" as Href);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.screen}>
          {/* ── Top bar: back + dots ── */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <View style={styles.dotsWrap}>
              <PageDots total={4} current={3} />
            </View>
            <View style={styles.backBtn} />
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              keyboardVisible && styles.scrollContentKeyboard,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Everything shifts up when keyboard opens */}
            <Animated.View
              style={[
                styles.innerContent,
                { transform: [{ translateY: contentShiftY }] },
              ]}
            >
              {/* Illustration card — shrinks when keyboard visible */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardY }, { scale: cardScale }],
                    marginBottom: keyboardVisible ? 8 : 24,
                  },
                ]}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>👋</Text>
                </View>
                <Text style={styles.cardLabel}>Let&apos;s Start</Text>
              </Animated.View>

              {/* Headline */}
              <Animated.View
                style={{
                  opacity: inputOpacity,
                  transform: [{ translateY: inputY }],
                }}
              >
                <Text style={styles.headline}>
                  What&apos;s your first name?
                </Text>
              </Animated.View>

              {/* Name input */}
              <Animated.View
                style={{
                  opacity: inputOpacity,
                  transform: [{ translateY: inputY }],
                  width: "100%",
                }}
              >
                <TextInput
                  ref={inputRef}
                  value={value}
                  onChangeText={setValue}
                  placeholder="e.g. Kwame"
                  placeholderTextColor="#B0BEC5"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  maxLength={40}
                />
              </Animated.View>

              {/* Hint text */}
              <Animated.Text style={[styles.subtext, { opacity: hintOpacity }]}>
                We&apos;ll use it to personalize your experience.
              </Animated.Text>
            </Animated.View>
          </ScrollView>

          {/* ── Bottom CTA ── */}
          <Animated.View
            style={[
              styles.footer,
              { opacity: footerOpacity, transform: [{ translateY: footerY }] },
            ]}
          >
            <PrimaryButton
              title={trimmed ? `Continue as ${trimmed}` : "Continue"}
              onPress={handleContinue}
              style={{ width: "100%" }}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
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
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
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
  scrollContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 24,
  },
  scrollContentKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 8,
  },
  innerContent: {
    alignItems: "center",
    width: "100%",
  },
  card: {
    width: "100%",
    aspectRatio: 1.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 23, 42, 0.08)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(44, 62, 91, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 40,
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
    marginBottom: 20,
  },
  input: {
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
