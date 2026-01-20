import { RejectUpload, type Router, route } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";

import { headers } from "next/headers";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import { s3 } from "@/lib/s3";

const router: Router = {
  client: s3,
  bucketName: env.S3_BUCKET_NAME,
  routes: {
    memes: route({
      multipleFiles: false,
      fileTypes: ["image/*"],
      onBeforeUpload: async () => {
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
            key: `memes/${user.user.id}/${Date.now()}-meme`,
            metadata: {
              author: user.user.id,
            },
          },
        };
      },
    }),
    avatar: route({
      multipleFiles: false,
      fileTypes: ["image/*"],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      onBeforeUpload: async () => {
        const user = await auth.api.getSession({
          headers: await headers(),
        });

        if (!user) {
          throw new RejectUpload(
            "Debes iniciar sesión para subir una imagen de perfil",
          );
        }
        return {
          objectInfo: {
            key: `avatars/${user.user.id}/${Date.now()}-avatar`,
            metadata: {
              userId: user.user.id,
            },
          },
        };
      },
    }),
  },
};

export const { POST } = toRouteHandler(router);
