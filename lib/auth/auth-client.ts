import { createAuthClient } from "better-auth/react";
import { env } from "@/env/client";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, useSession } = authClient;
