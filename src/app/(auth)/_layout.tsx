import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

/**
 * Auth route group layout.
 * Redirects signed-in users away from auth screens.
 */
export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(onboarding)/trial" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
