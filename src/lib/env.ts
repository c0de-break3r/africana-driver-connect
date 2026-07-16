export const dojahConfig = {
  appId: process.env.EXPO_PUBLIC_DOJAH_APP_ID ?? "",
  secretKey: process.env.EXPO_PUBLIC_DOJAH_SECRET_KEY ?? "",
  environment: (process.env.EXPO_PUBLIC_DOJAH_ENVIRONMENT as "sandbox" | "production") ?? "sandbox",
};

export const clerkConfig = {
  publishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
};

export const convexConfig = {
  url: process.env.EXPO_PUBLIC_CONVEX_URL ?? "",
};

export const googleMapsConfig = {
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
};