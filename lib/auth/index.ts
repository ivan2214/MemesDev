import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { customSession, magicLink } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import authConfig from "@/config/auth.config";
import { db } from "@/db"; // your drizzle instance
import { user as userTable } from "@/db/schemas";

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
    customSession(async ({ user, session }) => {
      const userDB = await db.query.user.findFirst({
        where: eq(userTable.id, user.id),
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
          category: true,
        },
      });

      if (!userDB) {
        return {
          session,
          user,
        };
      }

      const parsedUser = {
        ...userDB,
        tags: userDB?.tags?.map((tag) => tag.tag),
      };

      return {
        session,
        user: parsedUser,
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
