import { useEffect, useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui";

/**
 * Trial screen — the first screen users see after authentication.
 * This is a placeholder that will be expanded in a later prompt.
 */
export default function Trial() {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScreenContainer>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You&apos;re in!</Text>
        <Text style={styles.subtitle}>
          Your account is ready.{"\n"}The full onboarding experience{"\n"}is
          coming next.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Authenticated with Clerk</Text>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  badge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
});
