import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

/**
 * Corporate route group — requires authentication.
 * Redirects unauthenticated users to the sign-in screen.
 */
export default function CorporateLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
