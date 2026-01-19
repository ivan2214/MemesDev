import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db"; // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
