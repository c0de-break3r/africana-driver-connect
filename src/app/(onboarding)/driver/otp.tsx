import { useSignUp } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { DriverStepShell } from "@/components/driver-step-shell";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useRoleStore } from "@/store/useRoleStore";

export default function DriverOtpScreen() {
  const { signUp } = useSignUp();
  const { verificationMethod, markOnboardingComplete } =
    useDriverOnboardingStore();
  const setOnboardingComplete = useRoleStore((s) => s.setOnboardingComplete);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canContinue = code.length === 6;

  const handleContinue = async () => {
    if (!signUp || !canContinue) return;
    setIsLoading(true);
    setError(null);

    try {
      const verifyResult =
        verificationMethod === "phone"
          ? await signUp.verifications.verifyPhoneCode({ code })
          : await signUp.verifications.verifyEmailCode({ code });

      if (verifyResult.error) {
        setError(verifyResult.error.longMessage ?? verifyResult.error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsLoading(false);
        return;
      }

      if (signUp.status === "complete") {
        markOnboardingComplete();
        setOnboardingComplete(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(driver)" as Href);
      } else {
        setError("Verification incomplete. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError("Invalid code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!signUp) return;
    try {
      if (verificationMethod === "phone") {
        await signUp.verifications.sendPhoneCode();
      } else {
        await signUp.verifications.sendEmailCode();
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Failed to resend code.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <DriverStepShell
      stepIndex={8}
      title="Enter verification code"
      description={`We sent a 6-digit code to your ${verificationMethod === "phone" ? "phone" : "email"}.`}
      buttonDisabled={!canContinue || isLoading}
      buttonTitle={isLoading ? "Verifying..." : "Verify"}
      onContinue={handleContinue}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <Text style={styles.label}>Verification code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          placeholderTextColor="#A0AAB4"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={styles.textLink} onPress={handleResend}>
          <Text style={styles.textLinkText}>
            Didn&apos;t get a code?{" "}
            <Text style={styles.textLinkBold}>Resend</Text>
          </Text>
        </Pressable>

        <Pressable
          style={styles.textLink}
          onPress={() => router.push("/(auth)/sign-up" as Href)}
        >
          <Text style={styles.textLinkText}>
            <Text style={styles.textLinkBold}>
              Change {verificationMethod === "phone" ? "phone number" : "email"}
            </Text>
          </Text>
        </Pressable>

        <View nativeID="clerk-captcha" />
      </ScrollView>
    </DriverStepShell>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    flex: 1,
    marginTop: 24,
  },
  formContent: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E5B",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E8ECF0",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: "center",
    letterSpacing: 8,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  textLink: {
    alignItems: "center",
    paddingVertical: 10,
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
