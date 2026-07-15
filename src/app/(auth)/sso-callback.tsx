import { useAuth, useSignIn, useSignUp } from "@clerk/expo";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { getPostAuthRoute } from "@/lib/routing";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * SSO Callback screen — handles the deep link redirect from Clerk's OAuth flow.
 *
 * When a user signs in via Google (or another OAuth provider), Clerk redirects
 * back to the app at `africandriverconnect://sso-callback` with query params:
 *   - created_session_id: the new Clerk session
 *   - rotating_token_nonce: token needed to finalize the sign-in
 *
 * This screen extracts those params, finalizes the auth flow, and redirects
 * to the correct post-auth destination based on the user's role.
 */
export default function SSOCallback() {
  // useSignIn returns { signIn, setActive } at runtime (used by Clerk's own
  // useSSO implementation), but the TypeScript types only expose signIn.
  const signInResult = useSignIn() as unknown as {
    signIn: ReturnType<typeof useSignIn>["signIn"];
    setActive?: (opts: { session: string }) => Promise<void>;
  };
  const { signIn } = signInResult;
  const setActive = signInResult.setActive;
  const { signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const params = useLocalSearchParams<{
    created_session_id?: string;
    rotating_token_nonce?: string;
  }>();

  const [error, setError] = useState<string | null>(null);
  const role = useRoleStore((s) => s.role);

  useEffect(() => {
    // If already signed in, the redirect below will handle it
    if (isSignedIn) return;

    async function handleCallback() {
      try {
        const nonce = params.rotating_token_nonce;

        if (signIn && nonce) {
          // Reload the sign-in with the rotating token nonce to finalize.
          // The reload method exists at runtime (used by Clerk's own useSSO
          // implementation) but is not present in the Signal-based type defs.
          await (signIn as any).reload({ rotatingTokenNonce: nonce });

          // If the verification is transferable, complete sign-up too
          if (signIn.firstFactorVerification?.status === "transferable") {
            await signUp?.create({ transfer: true });
          }

          // Set the session active
          const sessionId = signUp?.createdSessionId ?? signIn.createdSessionId;
          if (sessionId && setActive) {
            await setActive({ session: sessionId });
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "SSO callback failed.";
        setError(message);
      }
    }

    handleCallback();
  }, [signIn, signUp, setActive, isSignedIn, params.rotating_token_nonce]);

  // If already signed in (or after callback completes), redirect
  if (isSignedIn) {
    return <Redirect href={getPostAuthRoute(role)} />;
  }

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#2C3E5B" />
          <Text style={styles.loadingText}>Completing sign-in…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 14,
    textAlign: "center",
  },
});
