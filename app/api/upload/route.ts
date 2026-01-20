import { RejectUpload, type Router, route } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { tigris } from "@better-upload/server/clients";
import { headers } from "next/headers";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";

const router: Router = {
  client: tigris({
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    endpoint: env.S3_ENDPOINT_URL,
  }),
  bucketName: env.S3_BUCKET_NAME,
  routes: {
    memes: route({
      multipleFiles: false,
      fileTypes: ["image/*"],
      onBeforeUpload: async ({ file }) => {
        const user = await auth.api.getSession({
          headers: await headers(),
        });
        console.log("userdata:", {
          user,
        });

        if (!user) {
          throw new RejectUpload("Not logged in!");
        }
        return {
          objectInfo: {
            key: `memes/${user.user.id}/${file.name}`,
            metadata: {
              author: user.user.id,
            },
          },
        };
      },
    }),
  },
};

export const { POST } = toRouteHandler(router);
