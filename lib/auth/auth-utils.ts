import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schemas";

export const DEV_SUFFIXES = [
  "dev",
  "js",
  "ts",
  "ai",
  "cloud",
  "stack",
  "coder",
  "hacker",
  "shipit",
  "async",
  "await",
  "404",
  "null",
  "undefined",
  "loop",
  "bug",
  "fix",
  "commit",
  "merge",
  "push",
];

export const exists = async (username: string) => {
  return !!(await db.query.user.findFirst({
    where: eq(user.username, username),
  }));
};

export const randomItem = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const DEV_PREFIXES = ["dev", "its", "hey", "the", "real", "not"];

export const generateUsername = async (name: string): Promise<string> => {
  const base = name.toLowerCase().replace(/\s+/g, "");

  // 1. @name
  if (!(await exists(`@${base}`))) {
    return `@${base}`;
  }

  // 2. @name-suffix
  for (let i = 0; i < 5; i++) {
    const candidate = `@${base}-${randomItem(DEV_SUFFIXES)}`;
    if (!(await exists(candidate))) return candidate;
  }

  // 3. @prefix-name
  for (let i = 0; i < 5; i++) {
    const candidate = `@${randomItem(DEV_PREFIXES)}-${base}`;
    if (!(await exists(candidate))) return candidate;
  }

  // 4. @name + número corto
  for (let i = 0; i < 10; i++) {
    const candidate = `@${base}${Math.floor(Math.random() * 100)}`;
    if (!(await exists(candidate))) return candidate;
  }

  // 5. fallback (último recurso)
  return `@${base}-${Date.now().toString().slice(-4)}`;
};
