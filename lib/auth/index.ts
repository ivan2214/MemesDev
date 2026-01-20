import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import authConfig from "@/config/auth.config";
import { db } from "@/db"; // your drizzle instance

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  plugins: [
    magicLink({
      async sendMagicLink(data) {
        // Send an email to the user with a magic link
        const { sendEmail } = await import("@/lib/send-email");
        await sendEmail({
          to: data.email,
          type: "magic-link",
          magicLinkUrl: data.url,
          expiresIn: "15 minutos",
        });
      },

      expiresIn: 15 * 60 * 1000, // 15 minutos en milisegundos
    }),

    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
