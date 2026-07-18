export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://your-clerk-instance.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};