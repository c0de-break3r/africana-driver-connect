import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { images } from "@/constants/images";
import {
  ONBOARDING_SCREENS,
  useOnboardingAnswersStore,
} from "@/store/useOnboardingAnswersStore";

/**
 * Welcome screen — Act 1, Step 1.
 * First thing the user sees. Warm greeting, app logo, single CTA.
 * Staggered entrance with typewriter text reveal.
 *
 * Layout reference: image-reference/onboarding/onboarding03–04.jpg
 */

const HEADLINE = "Hey there.";
const SUBTEXT = "Your ride across Africa starts here.";
const TYPE_RATE = 35; // ms per character

export default function Welcome() {
  // Icon: fade + scale
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

  // Headline: fade + slide + typewriter
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const headlineY = useRef(new Animated.Value(15)).current;
  const headlineType = useRef(new Animated.Value(0)).current;

  // Subtext: fade + slide + typewriter
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const subtextY = useRef(new Animated.Value(15)).current;
  const subtextType = useRef(new Animated.Value(0)).current;

  // Footer: fade + slide
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerY = useRef(new Animated.Value(20)).current;

  // Typewriter state
  const [hChars, setHChars] = useState(0);
  const [sChars, setSChars] = useState(0);
  const hPrev = useRef(0);
  const sPrev = useRef(0);

  const headlineText = useMemo(() => HEADLINE.slice(0, hChars), [hChars]);
  const subtextContent = useMemo(() => SUBTEXT.slice(0, sChars), [sChars]);

  // Re-trigger all animations when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      iconOpacity.setValue(0);
      iconScale.setValue(0.8);
      headlineOpacity.setValue(0);
      headlineY.setValue(15);
      subtextOpacity.setValue(0);
      subtextY.setValue(15);
      footerOpacity.setValue(0);
      footerY.setValue(20);
      headlineType.setValue(0);
      subtextType.setValue(0);
      hPrev.current = 0;
      sPrev.current = 0;
      setHChars(0);
      setSChars(0);

      Animated.parallel([
        // 1. Icon fades in + spring scale — 100ms
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(iconOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
              toValue: 1,
              tension: 60,
              friction: 10,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 2. Headline fade + slide — 500ms
        Animated.sequence([
          Animated.delay(500),
          Animated.parallel([
            Animated.timing(headlineOpacity, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(headlineY, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
        ]),

        // 3. Subtext fade + slide — 650ms
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

        // 4. Footer fade + slide — 900ms
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

        // 5. Headline typewriter — starts with headline fade
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(headlineType, {
            toValue: HEADLINE.length,
            duration: HEADLINE.length * TYPE_RATE,
            useNativeDriver: false,
          }),
        ]),

        // 6. Subtext typewriter — starts after subtext fade
        Animated.sequence([
          Animated.delay(650),
          Animated.timing(subtextType, {
            toValue: SUBTEXT.length,
            duration: SUBTEXT.length * TYPE_RATE,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }, [
      iconOpacity,
      iconScale,
      headlineOpacity,
      headlineY,
      subtextOpacity,
      subtextY,
      footerOpacity,
      footerY,
      headlineType,
      subtextType,
    ]),
  );

  // Typewriter listeners
  useEffect(() => {
    const headlineListener = headlineType.addListener(({ value }) => {
      const n = Math.floor(value);
      if (n !== hPrev.current) {
        hPrev.current = n;
        setHChars(n);
      }
    });
    const subtextListener = subtextType.addListener(({ value }) => {
      const n = Math.floor(value);
      if (n !== sPrev.current) {
        sPrev.current = n;
        setSChars(n);
      }
    });

    return () => {
      headlineType.removeListener(headlineListener);
      subtextType.removeListener(subtextListener);
    };
  }, [headlineType, subtextType]);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useOnboardingAnswersStore.getState().setLastCompletedScreen("welcome");
    router.push("/(onboarding)/problem" as Href);
  };

  // Auto-redirect if user has saved progress
  const lastCompletedScreen = useOnboardingAnswersStore(
    (s) => s.lastCompletedScreen,
  );
  const firstName = useOnboardingAnswersStore((s) => s.firstName);
  useEffect(() => {
    if (lastCompletedScreen && firstName) {
      const idx = ONBOARDING_SCREENS.indexOf(lastCompletedScreen);
      const nextScreen = ONBOARDING_SCREENS[idx + 1];
      if (nextScreen) {
        router.replace(`/(onboarding)/${nextScreen}` as Href);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar: page dots ── */}
        <PageDots total={4} current={0} />

        {/* ── Center content ── */}
        <View style={styles.body}>
          {/* Icon — fades in + scales up */}
          <Animated.View
            style={{ opacity: iconOpacity, transform: [{ scale: iconScale }] }}
          >
            <Image
              source={images.appIcon}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>

          {/* Headline — fade + slide + typewriter */}
          <Animated.Text
            style={[
              styles.headline,
              {
                opacity: headlineOpacity,
                transform: [{ translateY: headlineY }],
              },
            ]}
          >
            {headlineText}
          </Animated.Text>

          {/* Subtext — fade + slide + typewriter */}
          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: subtextOpacity,
                transform: [{ translateY: subtextY }],
              },
            ]}
          >
            {subtextContent}
          </Animated.Text>
        </View>

        {/* ── Bottom CTA — fades in + slides up ── */}
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
          <Text style={styles.terms}>
            By continuing you accept our{" "}
            <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Notice</Text>
          </Text>
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
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  headline: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    gap: 12,
  },
  terms: {
    fontSize: 10,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    color: "#2C3E5B",
    fontWeight: "600",
  },
});
