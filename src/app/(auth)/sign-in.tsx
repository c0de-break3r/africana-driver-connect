import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Link, router, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";

/**
 * Sign-in screen — email + password.
 * Matches the visual style of sign-up.tsx.
 * Uses Clerk's useSignIn hook for the JS custom flow.
 */
export default function SignIn() {
  const { signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;

  Animated.parallel([
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }),
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(formY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]),
  ]).start();

  const handleSubmit = async () => {
    if (!signIn) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn.password({
        identifier: email,
        password,
      });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (signIn.status === "complete") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/(onboarding)/trial" as Href);
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch {
      setError("Failed to sign in. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <Text style={styles.icon}>👋</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your journey {"\n"}with Africana Driver Connect.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.formCard,
            { opacity: formOpacity, transform: [{ translateY: formY }] },
          ]}
        >
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#B0BEC5"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#B0BEC5"
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonSpacer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <PrimaryButton
                title="Sign In"
                onPress={handleSubmit}
                style={{ width: "100%" }}
                disabled={!email || !password}
              />
            )}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={styles.footerLink}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  icon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "rgba(15, 23, 42, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
    backgroundColor: "#F8FAFB",
    borderWidth: 1.5,
    borderColor: "#E8ECF0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonSpacer: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 15,
    color: "#6E7E91",
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
  },
});
