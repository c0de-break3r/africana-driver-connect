import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

/**
 * Profile completion placeholder.
 *
 * This is the entry point for the full document-upload flow. For now it marks
 * the profile as complete so the home banner is dismissed; the actual upload
 * screens can be added here later.
 */
export default function CompleteProfileScreen() {
  const markProfileDocumentsUploaded = useDriverOnboardingStore(
    (s) => s.markProfileDocumentsUploaded,
  );

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markProfileDocumentsUploaded();
    router.replace("/(driver)" as Href);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        <Pressable
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(driver)" as Href)
          }
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Text style={styles.title}>Complete your profile</Text>
        <Text style={styles.body}>
          Upload your license photo, Ghana Card, and police clearance here. This
          screen will be expanded into the full document upload flow.
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Mark as complete"
          onPress={handleComplete}
          style={{ width: "100%" }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
    marginTop: -2,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
  },
});
