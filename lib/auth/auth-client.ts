import { passkeyClient } from "@better-auth/passkey/client";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env/client";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [magicLinkClient(), passkeyClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
