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
  const savedName = useOnboardingAnswersStore((s) => s.firstName);
  const [value, setValue] = useState(savedName ?? "");
  const setFirstName = useOnboardingAnswersStore((s) => s.setFirstName);
  const inputRef = useRef<TextInput>(null);

  // Input focus state
  const [isFocused, setIsFocused] = useState(false);

  // Staggered animations
  const emojiOpacity = useRef(new Animated.Value(0)).current;
  const emojiScale = useRef(new Animated.Value(0.5)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(15)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputY = useRef(new Animated.Value(15)).current;
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  // Keyboard show/hide — shift content up when keyboard visible
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        // No card to hide — just let KeyboardAvoidingView handle it
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {},
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      emojiOpacity.setValue(0);
      emojiScale.setValue(0.5);
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      inputOpacity.setValue(0);
      inputY.setValue(15);
      hintOpacity.setValue(0);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        // Emoji pops in — 100ms
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(emojiOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(emojiScale, {
              toValue: 1,
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Headline fades in — 350ms
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(headlineOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(headlineY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // Input slides in — 550ms
        Animated.sequence([
          Animated.delay(550),
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

        // Hint fades in — 750ms
        Animated.sequence([
          Animated.delay(750),
          Animated.timing(hintOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),

        // Footer slides in — 900ms
        Animated.sequence([
          Animated.delay(900),
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
        inputRef.current?.focus();
      });
    }, [
      emojiOpacity,
      emojiScale,
      headlineOpacity,
      headlineY,
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
    useOnboardingAnswersStore.getState().setLastCompletedScreen("name");
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
            <View style={styles.backBtnSpacer} />
          </View>

          {/* ── Scrollable content ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Small emoji — no card wrapper */}
            <Animated.Text
              style={[
                styles.emoji,
                {
                  opacity: emojiOpacity,
                  transform: [{ scale: emojiScale }],
                },
              ]}
            >
              👋
            </Animated.Text>

            {/* Headline */}
            <Animated.View
              style={{
                opacity: headlineOpacity,
                transform: [{ translateY: headlineY }],
              }}
            >
              <Text style={styles.headline}>What&apos;s your first name?</Text>
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
                style={[styles.input, isFocused && styles.inputFocused]}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                maxLength={40}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </Animated.View>

            {/* Hint text */}
            <Animated.Text style={[styles.subtext, { opacity: hintOpacity }]}>
              We&apos;ll use it to personalize your experience.
            </Animated.Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnSpacer: {
    width: 40,
  },
  backArrow: {
    fontSize: 28,
    color: "#2C3E5B",
    fontWeight: "300",
  },
  dotsWrap: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
    paddingTop: 16,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 32,
  },
  input: {
    fontSize: 20,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    textAlign: "left",
    shadowColor: "rgba(15, 23, 42, 0.04)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  inputFocused: {
    borderColor: "#2C3E5B",
    shadowColor: "rgba(44, 62, 91, 0.15)",
    shadowRadius: 12,
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
