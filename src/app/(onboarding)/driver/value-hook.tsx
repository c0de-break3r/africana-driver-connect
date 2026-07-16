import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  type PanResponderGestureState,
} from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDER_WIDTH = SCREEN_WIDTH - 56 - 48; // Card padding 24*2 + thumb radius
const MIN_HOURS = 10;
const MAX_HOURS = 70;
const HOURLY_RATE = 50;
const TOTAL_STEPS = 15;

export default function ValueHook() {
  const [hours, setHours] = useState(MIN_HOURS);
  const [isSliding, setIsSliding] = useState(false);
  const [thumbAnim] = useState(new Animated.Value(0));
  const thumbRef = useRef<View>(null);

  const setStep = useDriverOnboardingStore((s) => s.setStep);

  const earnings = hours * HOURLY_RATE;

  const handleThumbPressIn = () => {
    setIsSliding(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleThumbPressOut = () => {
    setIsSliding(false);
  };

  const calculateHoursFromX = (translateX: number) => {
    const clampedX = Math.max(0, Math.min(SLIDER_WIDTH, translateX));
    return Math.round(
      MIN_HOURS + (clampedX / SLIDER_WIDTH) * (MAX_HOURS - MIN_HOURS)
    );
  };

  const handlePanResponderMove = (_: unknown, gesture: PanResponderGestureState) => {
    if (!isSliding) return;
    setHours(calculateHoursFromX(gesture.moveX));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: handleThumbPressIn,
        onPanResponderMove: handlePanResponderMove,
        onPanResponderRelease: handleThumbPressOut,
        onPanResponderTerminate: handleThumbPressOut,
      }),
    []
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(1);
    router.push("/(onboarding)/driver/qualification-pre-check" as Href);
  };

  const progress = (hours - MIN_HOURS) / (MAX_HOURS - MIN_HOURS);
  const thumbTranslateX = SLIDER_WIDTH * progress;

  return (
    <ScreenContainer>
      <View style={styles.swipeLayer}>
        {/* ── Header with progress dots ── */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={TOTAL_STEPS} current={0} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Main Content ── */}
        <View style={styles.content}>
          <Text style={styles.title}>
            Drive & Earn on Your Own Terms{" "}
            <Text style={styles.emoji}>💰</Text>
          </Text>

          <Text style={styles.body}>
            Set your own hours, keep 100% of your tips, and enjoy instant payouts
            via Mobile Money (MoMo).
          </Text>

          {/* ── Earnings Slider ── */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Drag to see weekly potential:</Text>

            <View style={styles.sliderTrack} {...panResponder.panHandlers}>
              <View
                style={[
                  styles.sliderFill,
                  { width: SLIDER_WIDTH * progress },
                ]}
              />
              <Animated.View
                ref={thumbRef}
                style={[
                  styles.sliderThumb,
                  { transform: [{ translateX: thumbTranslateX - 14 }] },
                ]}
                {...panResponder.panHandlers}
              />
            </View>

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelValue}>
                {MIN_HOURS} hrs
              </Text>
              <Text style={styles.sliderLabelValue}>
                {MAX_HOURS} hrs
              </Text>
            </View>

            <Text style={styles.earningsText}>
              Drive <Text style={styles.earningsHighlight}>{hours}</Text> hours a
              week, earn up to{" "}
              <Text style={styles.earningsHighlight}>
                GH₵ {earnings.toLocaleString()}
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Next: Check Eligibility →"
            onPress={handleContinue}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  swipeLayer: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  dotsWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7B54",
    backgroundColor: "#FFF3EF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 36,
  },
  body: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  sliderContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 20,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: "#E8EDF2",
    borderRadius: 4,
    position: "relative",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#FF7B54",
    borderRadius: 4,
  },
  sliderThumb: {
    position: "absolute",
    top: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF7B54",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#FF7B54",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateX: -14 }],
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sliderLabelValue: {
    fontSize: 12,
    color: "#6E7E91",
    fontWeight: "500",
  },
  earningsText: {
    marginTop: 24,
    fontSize: 16,
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  earningsHighlight: {
    fontWeight: "800",
    color: "#FF7B54",
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
});