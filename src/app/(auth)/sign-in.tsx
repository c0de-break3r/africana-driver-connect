import { Image } from "expo-image";
import { Link, useLocalSearchParams } from "expo-router";
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
import { useSignInFlow } from "@/hooks/useSignInFlow";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

/**
 * Sign-in screen — thin composition of shared auth components + hooks.
 *
 * Layout: back button, app icon, email/password form, forgot-password link,
 * Continue button, social divider + Google button, sign-up footer link.
 *
 * Business logic lives in `useSignInFlow`.
 * Entrance animation lives in `useStaggeredEntrance`.
 */
export default function SignIn() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const entrance = useStaggeredEntrance();
  const flow = useSignInFlow();

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
      {/* ── Back button ── */}
      <AuthBackButton opacity={entrance.headerOpacity} goBack="welcome" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── App Icon ── */}
        <Animated.View
          style={[
            styles.iconWrap,
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
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

          {/* Forgot password */}
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotWrap} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </Link>

          {/* Continue button */}
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
                <Text style={styles.primaryBtnText}>Continue</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* ── Social + Footer ── */}
        <Animated.View style={{ opacity: entrance.footerOpacity }}>
          <AuthSocialButtons
            loading={flow.googleLoading}
            onGooglePress={flow.handleGoogleSignIn}
          />
        </Animated.View>

        <Animated.View style={{ opacity: entrance.footerOpacity }}>
          <AuthFooter variant="sign-up-link" from={from} />
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
  iconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  form: {
    marginBottom: 28,
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
});
