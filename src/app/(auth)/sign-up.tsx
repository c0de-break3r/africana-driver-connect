import { useSignUp } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Link, router, type Href } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";

/**
 * Sign-up screen — email + password + OTP verification.
 * Personalized framing: "Save your answers, [Name] — create your account"
 * Uses Clerk's useSignUp hook for the JS custom flow.
 */
export default function SignUp() {
  const { signUp } = useSignUp();
  const firstName = useOnboardingAnswersStore((s) => s.firstName) ?? "there";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;

  // Animate on mount
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
    if (!signUp) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(sendError.longMessage ?? sendError.message);
        } else {
          setPendingVerification(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (signUp.status === "complete") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/(onboarding)/trial" as Href);
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      setError("Invalid code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Failed to resend code.");
    }
  };

  if (pendingVerification) {
    return (
      <ScreenContainer>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Animated.View style={{ opacity: headerOpacity }}>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              { opacity: formOpacity, transform: [{ translateY: formY }] },
            ]}
          >
            <Text style={styles.label}>Verification code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#B0BEC5"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonSpacer}>
              <PrimaryButton
                title={loading ? "Verifying..." : "Verify Email"}
                onPress={handleVerify}
                style={{ width: "100%" }}
                disabled={loading || code.length < 6}
              />
            </View>

            <Pressable style={styles.textLink} onPress={handleResendCode}>
              <Text style={styles.textLinkText}>
                Didn&apos;t get a code?{" "}
                <Text style={styles.textLinkBold}>Resend</Text>
              </Text>
            </Pressable>

            <Pressable
              style={styles.textLink}
              onPress={() => setPendingVerification(false)}
            >
              <Text style={styles.textLinkText}>
                <Text style={styles.textLinkBold}>Change email</Text>
              </Text>
            </Pressable>
          </Animated.View>

          <View nativeID="clerk-captcha" />
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Save your answers, {firstName} — {"\n"}create your account to
            continue.
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
            placeholder="Create a strong password"
            placeholderTextColor="#B0BEC5"
            secureTextEntry
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonSpacer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <PrimaryButton
                title="Create Account"
                onPress={handleSubmit}
                style={{ width: "100%" }}
                disabled={!email || !password || password.length < 8}
              />
            )}
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={styles.footerLink}>Sign in</Text>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
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
  emailHighlight: {
    fontWeight: "600",
    color: "#2C3E5B",
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
  textLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  textLinkText: {
    fontSize: 14,
    color: "#6E7E91",
  },
  textLinkBold: {
    fontWeight: "600",
    color: "#2C3E5B",
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
