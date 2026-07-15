import { useSSO, useSignUp } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

import { navigatePostAuth } from "@/lib/routing";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Account creation + OTP email verification via Clerk's `useSignUp`.
 *
 * Handles:
 * - Email/password creation with driver onboarding metadata attachment
 * - OTP email code send, verify, and resend
 * - Google SSO sign-up with session finalization
 * - Two-phase UI: creation form → OTP verification
 * - Haptic feedback on success/error
 * - Post-auth navigation based on the user's role
 *
 * Returns all state and handlers needed by the sign-up screen.
 */
export function useSignUpFlow() {
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const role = useRoleStore((s) => s.role);
  const driverOnboarding = useDriverOnboardingStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
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
                verificationPipelineStatus:
                  driverOnboarding.verificationPipelineStatus,
                faceMatchPassed: driverOnboarding.faceMatchPassed,
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
  }, [signUp, email, password, role, driverOnboarding]);

  const handleVerify = useCallback(async () => {
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
        navigatePostAuth();
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch {
      setError("Invalid code. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [signUp, code]);

  const handleResendCode = useCallback(async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Failed to resend code.");
    }
  }, [signUp]);

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
        navigatePostAuth();
      }
    } catch {
      setError("Google sign-up failed. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  return {
    // State
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    showPassword,
    setShowPassword,
    pendingVerification,
    setPendingVerification,
    error,
    loading,
    googleLoading,
    // Handlers
    handleSubmit,
    handleVerify,
    handleResendCode,
    handleGoogleSignUp,
    // Derived
    canSubmit: !!email && !!password && password.length >= 8,
    canVerify: code.length >= 6,
  };
}
