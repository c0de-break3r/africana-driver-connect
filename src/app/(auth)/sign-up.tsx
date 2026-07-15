import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    AuthBackButton,
    AuthFooter,
    AuthInput,
    AuthSocialButtons,
} from "@/components/ui";
import { images } from "@/constants/images";
import { useSignUpFlow } from "@/hooks/useSignUpFlow";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

/**
 * Sign-up screen — thin composition of shared auth components + hooks.
 *
 * Phase 1: email + password form + Google SSO + sign-in footer link.
 * Phase 2: OTP email verification with resend and change-email options.
 *
 * Business logic lives in `useSignUpFlow`.
 * Entrance animation lives in `useStaggeredEntrance`.
 */
export default function SignUp() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const entrance = useStaggeredEntrance();
  const flow = useSignUpFlow();

  /* ── OTP Verification Phase ── */
  if (flow.pendingVerification) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
        <AuthBackButton opacity={entrance.headerOpacity} goBack="welcome" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* App Icon */}
          <Animated.View
            style={[
              styles.mascotWrap,
              {
                opacity: entrance.iconOpacity,
                transform: [{ scale: entrance.iconScale }],
              },
            ]}
          >
            <Image
              source={images.appIcon}
              style={styles.appIconImage}
              contentFit="contain"
            />
          </Animated.View>

          <Animated.View
            style={[styles.header, { opacity: entrance.headerOpacity }]}
          >
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{"\n"}
              <Text style={styles.emailHighlight}>{flow.email}</Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: entrance.formOpacity,
                transform: [{ translateY: entrance.formTranslateY }],
              },
            ]}
          >
            <AuthInput
              label="Verification code"
              value={flow.code}
              onChangeText={flow.setCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

            <View style={styles.buttonSpacer}>
              {flow.loading ? (
                <ActivityIndicator size="large" color="#2C3E5B" />
              ) : (
                <Pressable
                  style={[
                    styles.primaryBtn,
                    !flow.canVerify && styles.primaryBtnDisabled,
                  ]}
                  onPress={flow.handleVerify}
                  disabled={flow.loading || !flow.canVerify}
                >
                  <Text style={styles.primaryBtnText}>Verify Email</Text>
                </Pressable>
              )}
            </View>

            <Pressable style={styles.textLink} onPress={flow.handleResendCode}>
              <Text style={styles.textLinkText}>
                Didn&apos;t get a code?{" "}
                <Text style={styles.textLinkBold}>Resend</Text>
              </Text>
            </Pressable>

            <Pressable
              style={styles.textLink}
              onPress={() => flow.setPendingVerification(false)}
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
      <AuthBackButton opacity={entrance.headerOpacity} goBack="welcome" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mascot ── */}
        <Animated.View
          style={[
            styles.mascotWrap,
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
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
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <AuthInput
            label="Email"
            value={flow.email}
            onChangeText={flow.setEmail}
            placeholder="Email"
            keyboardType="email-address"
          />

          <AuthInput
            label="Password"
            value={flow.password}
            onChangeText={flow.setPassword}
            placeholder="Password"
            secure
          />

          {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

          {/* Sign Up button */}
          <View style={styles.buttonSpacer}>
            {flow.loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <Pressable
                style={[
                  styles.primaryBtn,
                  !flow.canSubmit && styles.primaryBtnDisabled,
                ]}
                onPress={flow.handleSubmit}
                disabled={!flow.canSubmit}
              >
                <Text style={styles.primaryBtnText}>Sign Up</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* ── Social + Footer ── */}
        <Animated.View style={{ opacity: entrance.footerOpacity }}>
          <AuthSocialButtons
            loading={flow.googleLoading}
            onGooglePress={flow.handleGoogleSignUp}
          />
        </Animated.View>

        <Animated.View style={{ opacity: entrance.footerOpacity }}>
          <AuthFooter variant="sign-in-link" from={from} />
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
  form: {
    marginBottom: 28,
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
});
