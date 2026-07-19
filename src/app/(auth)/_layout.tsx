import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { useConvexUser } from "@/hooks/useConvexUser";
import { getPostAuthRoute } from "@/lib/routing";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Auth route group layout.
 *
 * - Calls `useConvexUser` to auto-sync signed-in Clerk users to Convex.
 * - Redirects signed-in users away from auth screens to their role-based dashboard.
 * - Returns null while Clerk auth is still loading.
 */
export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  // Sync Clerk user to Convex whenever a user is signed in.
  // The hook is a no-op when not signed in, so it's safe to call here.
  useConvexUser();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={getPostAuthRoute(role)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    />
  );
}
