import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

import { navigatePostAuth } from "@/lib/routing";

export type PasswordResetPhase = "email" | "code" | "password" | "success";

/**
 * 4-phase password reset flow via Clerk's `useSignIn().signIn.resetPasswordEmailCode`.
 *
 * Phases:
 * 1. **email**    — enter email, send reset code
 * 2. **code**     — verify 6-digit code from email
 * 3. **password** — enter new password, submit
 * 4. **success**  — confirmation screen, redirect to sign-in
 *
 * Returns all state and handlers needed by the forgot-password screen.
 */
export function usePasswordReset() {
  const { signIn, fetchStatus } = useSignIn();

  const [phase, setPhase] = useState<PasswordResetPhase>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";

  const handleSendCode = useCallback(async () => {
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
  }, [signIn, email]);

  const handleVerifyCode = useCallback(async () => {
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
  }, [signIn, code]);

  const handleResetPassword = useCallback(async () => {
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
          navigatePostAuth();
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
  }, [signIn, password]);

  /** Resend the verification code (called from code phase). */
  const handleResendCode = handleSendCode;

  /** Get the phase-specific title for the headline. */
  const getTitle = useCallback(() => {
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
  }, [phase]);

  /** Get the phase-specific subtitle for the headline. */
  const getSubtitle = useCallback(() => {
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
  }, [phase, email]);

  /** Phase-specific button label. */
  const getButtonLabel = useCallback(() => {
    switch (phase) {
      case "email":
        return "Send reset code";
      case "code":
        return "Verify code";
      case "password":
        return "Reset password";
      case "success":
        return "Sign in";
    }
  }, [phase]);

  /** Phase-specific action handler (for the main button). */
  const handleAction = useCallback(() => {
    switch (phase) {
      case "email":
        return handleSendCode();
      case "code":
        return handleVerifyCode();
      case "password":
        return handleResetPassword();
      case "success":
        return; // Handled by screen-level navigation
    }
  }, [phase, handleSendCode, handleVerifyCode, handleResetPassword]);

  /** Whether the main button should be disabled for the current phase. */
  const isActionDisabled =
    (phase === "email" && !email.trim()) ||
    (phase === "code" && !code.trim()) ||
    (phase === "password" && !password);

  return {
    // State
    phase,
    setPhase,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    isFetching,
    // Handlers
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    handleAction,
    // Derived
    getTitle,
    getSubtitle,
    getButtonLabel,
    isActionDisabled,
  };
}
