import "dotenv/config";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_URL: z.url(),

    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_ENDPOINT_URL: z.url(),
    S3_BUCKET_NAME: z.string(),
    S3_BUCKET_URL: z.string(),

    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string(),

    DATABASE_URL: z.string(),

    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    EMAIL_FROM: z.string(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
  },
  experimental__runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
