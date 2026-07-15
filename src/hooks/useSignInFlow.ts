import { useSignIn, useSSO } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

import { navigatePostAuth } from "@/lib/routing";

/**
 * Email/password sign-in + Google OAuth via Clerk's `useSignIn` and `useSSO`.
 *
 * Handles:
 * - Email/password submission with error handling
 * - Google SSO flow with session finalization
 * - Loading states for both flows
 * - Haptic feedback on success/error
 * - Post-auth navigation based on the user's role
 *
 * Returns all state and handlers needed by the sign-in screen.
 */
export function useSignInFlow() {
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
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
        navigatePostAuth();
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch {
      setError("Failed to sign in. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [signIn, email, password]);

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
        navigatePostAuth();
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
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
    showPassword,
    setShowPassword,
    error,
    loading,
    googleLoading,
    // Handlers
    handleSubmit,
    handleGoogleSignIn,
    // Derived
    canSubmit: !!email && !!password,
  };
}
