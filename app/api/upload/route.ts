import { RejectUpload, type Router, route } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { getCurrentUser } from "@/data/user";
import { env } from "@/env/server";
import { s3 } from "@/lib/s3";

const router: Router = {
  client: s3,
  bucketName: env.S3_BUCKET_NAME,
  routes: {
    memes: route({
      multipleFiles: false,
      fileTypes: ["image/*"],
      onBeforeUpload: async () => {
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.id) {
          throw new RejectUpload("Not logged in!");
        }
        return {
          objectInfo: {
            key: `memes/${currentUser.id}/${Date.now()}-meme`,
            metadata: {
              author: currentUser.id,
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
        const currentUser = await getCurrentUser();

        if (!currentUser || !currentUser.id) {
          throw new RejectUpload(
            "Debes iniciar sesión para subir una imagen de perfil",
          );
        }
        return {
          objectInfo: {
            key: `avatars/${currentUser.id}/${Date.now()}-avatar`,
            metadata: {
              userId: currentUser.id,
            },
          },
        };
      },
    }),
  },
};

export const { POST } = toRouteHandler(router);
