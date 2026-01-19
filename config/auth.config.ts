import type { BetterAuthOptions } from "better-auth";
import { env } from "@/env/server";

export default {
  appName: "Memes Dev",
  baseURL: env.APP_URL,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID as string,
      clientSecret: env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
} as Pick<
  BetterAuthOptions,
  "appName" | "baseURL" | "socialProviders" | "trustedOrigins"
>;
