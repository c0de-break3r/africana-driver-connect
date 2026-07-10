import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";
import { images } from "@/constants/images";

/**
 * Welcome / splash screen — first thing the user sees.
 * Introduces the app and routes to role-select on tap.
 *
 * UX pattern reference: onboarding36.jpg (large heading + CTA + terms footer)
 * Design reference: html-reference/Splash & Onboarding Forms.html theme tokens
 */
export default function Welcome() {
  return (
    <ScreenContainer>
      <View className="flex-1 px-6 justify-between py-8">
        {/* ── Top spacer ── */}
        <View />

        {/* ── Center content ── */}
        <View className="items-center">
          {/* App logo — blends into the background, no container */}
          <Image
            source={images.appIcon}
            style={{ width: 220, height: 220 }}
            contentFit="contain"
          />

          <Text className="text-muted-foreground text-sm text-center mt-0 leading-5 px-4">
            The marketplace that connects drivers, vehicle owners, and clients
            across Africa. Find opportunities, hire talent, or book transport —
            all in one place.
          </Text>
        </View>

        {/* ── Bottom CTA ── */}
        <View className="gap-4">
          <PrimaryButton
            title="Get Started"
            onPress={() => {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              router.push("/(onboarding)/role-select");
            }}
            style={{ width: "100%" }}
          />

          <Text className="text-muted-foreground text-[10px] text-center leading-4">
            By continuing you accept our{" "}
            <Text className="text-foreground font-semibold">Terms of Use</Text>{" "}
            and{" "}
            <Text className="text-foreground font-semibold">
              Privacy Notice
            </Text>
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
