// convex/auth.config.ts
const authConfig = {
  providers: [
    {
      domain: "https://sacred-pup-5939.clerk.accounts.dev",
      applicationID: "convex", // ← must be "convex", not a dynamic env var
    },
  ],
};

export default authConfig;
