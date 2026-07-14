import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, router, type Href } from "expo-router";
import { useMemo, useState } from "react";
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

type Phase = "email" | "code" | "password" | "success";

export default function ForgotPassword() {
  const { signIn, fetchStatus } = useSignIn();

  const [phase, setPhase] = useState<Phase>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";

  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const formOpacity = useMemo(() => new Animated.Value(0), []);
  const formY = useMemo(() => new Animated.Value(20), []);

  useMemo(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(150),
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
  }, [headerOpacity, formOpacity, formY]);

  const handleSendCode = async () => {
    if (!email.trim()) return;
    setError(null);

    const { error: createError } = await signIn.create({
      identifier: email.trim(),
    });

    if (createError) {
      setError(createError.longMessage ?? createError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();

    if (sendError) {
      setError(sendError.longMessage ?? sendError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("code");
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return;
    setError(null);

    const { error: verifyError } =
      await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });

    if (verifyError) {
      setError(verifyError.longMessage ?? verifyError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("password");
  };

  const handleResetPassword = async () => {
    if (!password) return;
    setError(null);

    const { error: resetError } =
      await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });

    if (resetError) {
      setError(resetError.longMessage ?? resetError.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) {
            return;
          }
          router.replace("/(onboarding)/trial" as Href);
        },
      });

      if (finalizeError) {
        setError(finalizeError.longMessage ?? finalizeError.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase("success");
    }
  };

  const getTitle = () => {
    switch (phase) {
      case "email":
        return "Reset your password";
      case "code":
        return "Enter verification code";
      case "password":
        return "Create new password";
      case "success":
        return "Password updated";
    }
  };

  const getSubtitle = () => {
    switch (phase) {
      case "email":
        return "Enter your email and we'll send you a reset code.";
      case "code":
        return `We sent a 6-digit code to ${email}.`;
      case "password":
        return "Choose a strong new password for your account.";
      case "success":
        return "Your password has been reset. Sign in to continue.";
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
      {/* ── Back button ── */}
      <Animated.View style={[styles.backBtnWrap, { opacity: headerOpacity }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(auth)/sign-in" as Href);
          }}
          hitSlop={12}
        >
          <Text style={styles.backBtnText}>{"‹"}</Text>
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── App Icon ── */}
        <Animated.View style={[styles.iconWrap, { opacity: headerOpacity }]}>
          <Image
            source={images.appIcon}
            style={styles.iconImage}
            contentFit="contain"
          />
        </Animated.View>

        {/* ── Headline ── */}
        <Animated.View
          style={[
            styles.headlineWrap,
            { opacity: formOpacity, transform: [{ translateY: formY }] },
          ]}
        >
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
        </Animated.View>

        {/* ── Form ── */}
        <Animated.View
          style={[
            styles.form,
            { opacity: formOpacity, transform: [{ translateY: formY }] },
          ]}
        >
          {phase === "email" && (
            <>
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
                  editable={!isFetching}
                />
              </View>
            </>
          )}

          {phase === "code" && (
            <>
              <Text style={styles.label}>Verification code</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor="#A0AAB4"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isFetching}
                />
              </View>
              <Pressable
                onPress={handleSendCode}
                disabled={isFetching}
                hitSlop={8}
              >
                <Text style={styles.resendText}>Resend code</Text>
              </Pressable>
            </>
          )}

          {phase === "password" && (
            <>
              <Text style={styles.label}>New password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="New password"
                  placeholderTextColor="#A0AAB4"
                  secureTextEntry={!showPassword}
                  editable={!isFetching}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? "◉" : "◎"}</Text>
                </Pressable>
              </View>
            </>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {phase !== "success" && (
            <View style={styles.buttonSpacer}>
              {isFetching ? (
                <ActivityIndicator size="large" color="#2C3E5B" />
              ) : (
                <Pressable
                  style={[
                    styles.primaryBtn,
                    ((phase === "email" && !email.trim()) ||
                      (phase === "code" && !code.trim()) ||
                      (phase === "password" && !password)) &&
                      styles.primaryBtnDisabled,
                  ]}
                  onPress={
                    phase === "email"
                      ? handleSendCode
                      : phase === "code"
                        ? handleVerifyCode
                        : handleResetPassword
                  }
                  disabled={
                    (phase === "email" && !email.trim()) ||
                    (phase === "code" && !code.trim()) ||
                    (phase === "password" && !password)
                  }
                >
                  <Text style={styles.primaryBtnText}>
                    {phase === "email"
                      ? "Send reset code"
                      : phase === "code"
                        ? "Verify code"
                        : "Reset password"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {phase === "success" && (
            <View style={styles.buttonSpacer}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => router.replace("/(auth)/sign-in" as Href)}
              >
                <Text style={styles.primaryBtnText}>Sign in</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footerWrap, { opacity: formOpacity }]}>
          <Text style={styles.footerText}>Remember your password? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable hitSlop={8}>
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
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
  iconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  headlineWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
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
    marginBottom: 12,
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
  resendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E5B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonSpacer: {
    marginTop: 12,
  },
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
