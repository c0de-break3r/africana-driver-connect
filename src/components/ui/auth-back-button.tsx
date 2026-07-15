import { router, type Href } from "expo-router";
import { Animated, Platform, Pressable, StyleSheet, Text } from "react-native";

export type AuthBackButtonProps = {
  /** Animated opacity value from useStaggeredEntrance (header layer) */
  opacity: Animated.Value;
  /**
   * Where to navigate on back press.
   * - `"welcome"` → goes to Welcome screen (with canGoBack guard)
   * - `"sign-in"` → goes to sign-in screen (with canGoBack guard)
   * - Custom function for full control
   */
  goBack: "welcome" | "sign-in" | (() => void);
};

/**
 * Consistent back button for auth screens.
 *
 * Positioned absolute top-left with staggered entrance animation.
 * Back navigation logic:
 * - `welcome`: if `from=welcome` → replace to welcome, else canGoBack() or fallback
 * - `sign-in`: canGoBack() or replace to sign-in
 * - Custom function: full control
 *
 * Uses StyleSheet per AGENTS.md exception rules for animated styles + Pressable.
 */
export function AuthBackButton({ opacity, goBack }: AuthBackButtonProps) {
  const handlePress = () => {
    if (typeof goBack === "function") {
      goBack();
      return;
    }

    if (goBack === "welcome") {
      // If came from welcome screen, go back there
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(onboarding)/welcome" as Href);
      }
    } else {
      // sign-in fallback
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(auth)/sign-in" as Href);
      }
    }
  };

  return (
    <Animated.View style={[styles.backBtnWrap, { opacity }]}>
      <Pressable style={styles.backBtn} onPress={handlePress} hitSlop={12}>
        <Text style={styles.backBtnText}>{"‹"}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backBtnWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#2C3E5B",
  },
});
