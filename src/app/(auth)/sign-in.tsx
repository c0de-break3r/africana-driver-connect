import { useSignIn, useSSO } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
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

/**
 * Sign-in screen — layout based on reference image:
 * Tagline header, app icon illustration,
 * email + password inputs with labels, Continue button,
 * "or continue with" divider, Google SSO button,
 * "Don't have an account? Sign up" footer link.
 *
 * Back button behavior:
 * - If accessed from Welcome screen (from=welcome), goes back to Welcome
 * - If accessed from onboarding flow, goes to previous screen
 *
 * Preserves app's default teal color scheme.
 */
export default function SignIn() {
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
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Animations
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.85)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  // Staggered entrance animation
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
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
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

  const handleGoogleSignIn = useCallback(async () => {
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
      setError("Google sign-in failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
      {/* ── Back button ── */}
      <Animated.View style={[styles.backBtnWrap, { opacity: headerOpacity }]}>
        <Pressable style={styles.backBtn} onPress={goBack} hitSlop={12}>
          <Text style={styles.backBtnText}>{"‹"}</Text>
        </Pressable>
      </Animated.View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── App Icon ── */}
        <Animated.View
          style={[
            styles.iconWrap,
            { opacity: iconOpacity, transform: [{ scale: iconScale }] },
          ]}
        >
          <Image
            source={images.appIcon}
            style={styles.iconImage}
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

          {/* Forgot password — centered */}
          <Pressable style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Error */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Continue button */}
          <View style={styles.buttonSpacer}>
            {loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <Pressable
                style={[
                  styles.primaryBtn,
                  (!email || !password) && styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!email || !password}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
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

        {/* ── Google sign-in ── */}
        <Animated.View style={{ opacity: footerOpacity }}>
          <Pressable
            style={styles.socialBtn}
            onPress={handleGoogleSignIn}
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

        {/* ── Footer: Don't have an account? Sign up ── */}
        <Animated.View style={[styles.footerWrap, { opacity: footerOpacity }]}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <Link
            href={
              from
                ? (`/(auth)/sign-up?from=${from}` as Href)
                : "/(auth)/sign-up"
            }
          >
            <Text style={styles.footerLink}>Sign up</Text>
          </Link>
        </Animated.View>
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
  /* ── App Icon ── */
  iconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconImage: {
    width: 120,
    height: 120,
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
  forgotWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E5B",
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
