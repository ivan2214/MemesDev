import { tigris } from "@better-upload/server/clients";
import { env } from "@/env/server";

export const s3 = tigris({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  endpoint: env.S3_ENDPOINT_URL,
});
