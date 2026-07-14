import { useSSO, useSignUp } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

import { images } from "@/constants/images";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Sign-up screen — layout based on reference image:
 * Tagline header, app icon illustration,
 * email + password inputs with labels, Sign Up button,
 * "or continue with" divider, Google SSO button,
 * "Already have an account? Log in" footer link.
 *
 * Back button behavior:
 * - If accessed from Welcome screen (from=welcome), goes back to Welcome
 * - If accessed from onboarding flow, goes to previous screen
 *
 * Preserves app's default teal color scheme.
 *
 * Phase 1: email + password form + Google SSO.
 * Phase 2: OTP email verification.
 */
export default function SignUp() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  /** Navigate back based on where user came from. */
  const goBack = () => {
    if (from === "welcome") {
      router.replace("/(onboarding)/welcome" as Href);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(onboarding)/welcome" as Href);
    }
  };
  const { signUp } = useSignUp();
  const role = useRoleStore((s) => s.role);
  const driverOnboarding = useDriverOnboardingStore();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Animations
  const mascotOpacity = useMemo(() => new Animated.Value(0), []);
  const mascotScale = useMemo(() => new Animated.Value(0.85), []);
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const formOpacity = useMemo(() => new Animated.Value(0), []);
  const formY = useMemo(() => new Animated.Value(20), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);

  // Staggered entrance
  Animated.parallel([
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]),
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(mascotOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(mascotScale, {
          toValue: 1,
          tension: 50,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
    ]),
    Animated.sequence([
      Animated.delay(400),
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
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
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
        // Attach driver onboarding answers to the Clerk user so they survive login.
        if (role === "driver" && driverOnboarding.yearsExperience) {
          const { error: metadataError } = await signUp.update({
            unsafeMetadata: {
              driverOnboarding: {
                yearsExperience: driverOnboarding.yearsExperience,
                employmentStatus: driverOnboarding.employmentStatus,
                driverGoal: driverOnboarding.driverGoal,
                fullLegalName: driverOnboarding.fullLegalName,
                dateOfBirth: driverOnboarding.dateOfBirth,
                licenseClass: driverOnboarding.licenseClass,
                vehicleTypes: driverOnboarding.vehicleTypes,
                preferredJobType: driverOnboarding.preferredJobType,
                preferredLocation: driverOnboarding.preferredLocation,
                licenseVerificationStatus:
                  driverOnboarding.licenseVerificationStatus,
                licenseVerificationJobId:
                  driverOnboarding.licenseVerificationJobId,
              },
            },
          });
          if (metadataError) {
            console.warn(
              "Failed to attach onboarding metadata:",
              metadataError,
            );
          }
        }

        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(sendError.longMessage ?? sendError.message);
        } else {
          setPendingVerification(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch {
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
    } catch {
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

  const handleGoogleSignUp = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/(onboarding)/trial" as Href);
      }
    } catch {
      setError("Google sign-up failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  /* ── OTP Verification Phase ── */
  if (pendingVerification) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
        {/* Back button */}
        <Animated.View style={[styles.backBtnWrap, { opacity: headerOpacity }]}>
          <Pressable style={styles.backBtn} onPress={goBack} hitSlop={12}>
            <Text style={styles.backBtnText}>{"\u2039"}</Text>
          </Pressable>
        </Animated.View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* App Icon */}
          <Animated.View
            style={[
              styles.mascotWrap,
              { opacity: mascotOpacity, transform: [{ scale: mascotScale }] },
            ]}
          >
            <Image
              source={images.appIcon}
              style={styles.appIconImage}
              contentFit="contain"
            />
          </Animated.View>

          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.form,
              { opacity: formOpacity, transform: [{ translateY: formY }] },
            ]}
          >
            <Text style={styles.label}>Verification code</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#A0AAB4"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.buttonSpacer}>
              {loading ? (
                <ActivityIndicator size="large" color="#2C3E5B" />
              ) : (
                <Pressable
                  style={[
                    styles.primaryBtn,
                    (loading || code.length < 6) && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleVerify}
                  disabled={loading || code.length < 6}
                >
                  <Text style={styles.primaryBtnText}>Verify Email</Text>
                </Pressable>
              )}
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
      </View>
    );
  }

  /* ── Sign-up Form Phase ── */
  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
      {/* ── Back button ── */}
      <Animated.View style={[styles.backBtnWrap, { opacity: headerOpacity }]}>
        <Pressable style={styles.backBtn} onPress={goBack} hitSlop={12}>
          <Text style={styles.backBtnText}>{"\u2039"}</Text>
        </Pressable>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mascot ── */}
        <Animated.View
          style={[
            styles.mascotWrap,
            { opacity: mascotOpacity, transform: [{ scale: mascotScale }] },
          ]}
        >
          <Image
            source={images.appIcon}
            style={styles.mascotImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* ── Form ── */}
        <Animated.View
          style={[
            styles.form,
            { opacity: formOpacity, transform: [{ translateY: formY }] },
          ]}
        >
          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#A0AAB4"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#A0AAB4"
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Text style={styles.eyeIcon}>{showPassword ? "◉" : "◎"}</Text>
            </Pressable>
          </View>

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Sign Up button */}
          <View style={styles.buttonSpacer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <Pressable
                style={[
                  styles.primaryBtn,
                  (!email || !password || password.length < 8) &&
                    styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!email || !password || password.length < 8}
              >
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* ── Divider: or continue with ── */}
        <Animated.View style={[styles.dividerWrap, { opacity: footerOpacity }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* ── Google sign-up ── */}
        <Animated.View style={{ opacity: footerOpacity }}>
          <Pressable
            style={styles.socialBtn}
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#2C3E5B" />
            ) : (
              <View style={styles.socialRow}>
                <Image
                  source={images.googleG}
                  style={styles.googleIcon}
                  contentFit="contain"
                />
                <Text style={styles.socialBtnText}>Continue with Google</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* ── Footer: Already have an account? Log in ── */}
        <Animated.View style={[styles.footerWrap, { opacity: footerOpacity }]}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link
            href={
              from
                ? (`/(auth)/sign-in?from=${from}` as Href)
                : "/(auth)/sign-in"
            }
          >
            <Text style={styles.footerLink}>Log in</Text>
          </Link>
        </Animated.View>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  /* ── Back Button ── */
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
  /* ── Mascot ── */
  mascotWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  mascotImage: {
    width: 140,
    height: 140,
  },
  appIconImage: {
    width: 140,
    height: 140,
  },
  /* ── Header (OTP phase) ── */
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#2C3E5B",
  },
  /* ── Form ── */
  form: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#A0AAB4",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#E0E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#2C3E5B",
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: "#6E7E91",
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
  /* ── Primary Button ── */
  primaryBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
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
  /* ── Divider ── */
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E5EA",
  },
  dividerText: {
    fontSize: 13,
    color: "#A0AAB4",
    marginHorizontal: 14,
  },
  /* ── Social button ── */
  socialBtn: {
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#E0E5EA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  /* ── Footer ── */
  footerWrap: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#A0AAB4",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
});
