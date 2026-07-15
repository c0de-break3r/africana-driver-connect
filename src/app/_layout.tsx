import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL. Run `npx convex dev` to generate it.",
  );
}

const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ClerkProvider publishableKey={publishableKey}>
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </ConvexProvider>
  );
}
