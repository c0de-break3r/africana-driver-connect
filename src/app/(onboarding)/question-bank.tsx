import { Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui";

/**
 * Question bank screen — placeholder.
 * Full implementation comes in a later prompt.
 */
export default function QuestionBank() {
  return (
    <ScreenContainer>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-foreground text-2xl font-bold text-center">
          Question bank coming soon
        </Text>
        <Text className="text-muted-foreground text-sm text-center mt-2">
          This screen will ask deeper, personalized questions.
        </Text>
      </View>
    </ScreenContainer>
  );
}
