import { router } from "expo-router";
import { Text, View } from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";

/**
 * Placeholder sign-up screen.
 * Full auth implementation comes in a later prompt (Clerk).
 */
export default function SignUp() {
  return (
    <ScreenContainer>
      <View className="flex-1 px-6 justify-center items-center gap-6">
        <Text className="text-2xl font-bold text-foreground text-center">
          Create Your Account
        </Text>
        <Text className="text-sm text-muted-foreground text-center leading-5">
          Authentication will be set up with Clerk in a later step.
        </Text>
        <PrimaryButton
          title="Back to Role Select"
          onPress={() => router.back()}
          style={{ width: "100%" }}
        />
      </View>
    </ScreenContainer>
  );
}
