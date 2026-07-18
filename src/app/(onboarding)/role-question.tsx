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
    OnboardingOptionRow,
    PrimaryButton,
    ScreenContainer,
} from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore, type UserRole } from "@/store/useRoleStore";

/**
 * Role question screen — Act 1, Step 5.
 *
 * Layout (shared across onboarding choice screens):
 * - Centered headline at the top
 * - Description centered in the space between headline and options
 * - Option list with icon, title, description, divider, and right check badge
 * - Sticky Continue CTA disabled until a selection is made
 */

type RoleOption = {
  key: UserRole;
  icon: string;
  title: string;
  description: string;
};

const OPTIONS: RoleOption[] = [
  {
    key: "driver",
    icon: "🚗",
    title: "I'm a Driver",
    description: "Find driving jobs and opportunities.",
  },
  {
    key: "owner",
    icon: "🔑",
    title: "I Own a Vehicle",
    description: "Hire trusted drivers for your vehicle.",
  },
  {
    key: "client",
    icon: "📅",
    title: "I Need a Driver or Vehicle",
    description: "Book transport for an event or trip.",
  },
  {
    key: "corporate",
    icon: "🏢",
    title: "I Manage a Fleet",
    description: "Manage vehicles, drivers, and operations.",
  },
];

export default function RoleQuestion() {
  const setRole = useRoleStore((s) => s.setRole);
  const [selected, setSelected] = useState<UserRole | null>(null);

  // Entrance animations
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

  const handleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(role);
  };

  const handleContinue = () => {
    if (!selected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(selected);
    useOnboardingAnswersStore
      .getState()
      .setLastCompletedScreen("role-question");

    if (selected === "driver") {
      router.push("/(onboarding)/driver/kyc-intro" as Href);
    } else {
      router.push("/(onboarding)/foundational-questions" as Href);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar: back + dots ── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(onboarding)/welcome" as Href)
            }
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap} />
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content: headline / centered description / options ── */}
        <Animated.View
          style={[
            styles.body,
            { opacity: contentOpacity, transform: [{ translateY: contentY }] },
          ]}
        >
          <Text style={styles.headline}>How can we help you today?</Text>
          <Text style={styles.subtext}>
            Choose the option that best describes what you&apos;re looking for.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={styles.optionsList}
            contentContainerStyle={styles.optionsContent}
          >
            {OPTIONS.map((option, index) => (
              <OnboardingOptionRow
                key={option.key}
                icon={option.icon}
                title={option.title}
                description={option.description}
                selected={selected === option.key}
                isLast={index === OPTIONS.length - 1}
                onPress={() => handleSelect(option.key)}
              />
            ))}
          </ScrollView>
        </Animated.View>

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
            disabled={!selected}
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
  footer: {
    gap: 12,
  },
});
