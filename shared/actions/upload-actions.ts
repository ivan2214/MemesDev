"use server";

import sharp from "sharp";
import { getCurrentUser } from "@/data/user";
import { env } from "@/env/server";
import { s3 } from "@/lib/s3";

export async function uploadOptimizedImage(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("No has iniciado sesión");
  }

  const file = formData.get("file") as File;
  const type = formData.get("type") as string; // "avatar" | "meme"

  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let optimizedBuffer: Buffer;
  let key: string;

  if (type === "avatar") {
    // 500x500 max, 80% quality, jpeg or webp
    optimizedBuffer = await sharp(buffer)
      .resize(500, 500, {
        fit: "cover",
      })
      .toFormat("webp", { quality: 80 })
      .toBuffer();

    key = `avatars/${user.id}/${Date.now()}-avatar.webp`;
  } else {
    // Memes can be larger, but still optimized
    // Max width 1200?
    optimizedBuffer = await sharp(buffer)
      .resize(1200, null, {
        withoutEnlargement: true,
      })
      .toFormat("webp", { quality: 85 })
      .toBuffer();

    key = `memes/${user.id}/${Date.now()}-meme.webp`;
  }

  // Upload to S3 using the existing s3 client from lib/s3
  // s3.s3 is the AwsClient from aws4fetch
  const bucketUrl = s3.buildBucketUrl(env.S3_BUCKET_NAME);
  // Ensure bucketUrl doesn't have trailing slash and key doesn't have leading slash collision
  const url = `${bucketUrl}/${key}`;

  const headers: Record<string, string> = {
    "Content-Type": "image/webp",
  };

  if (type === "avatar") {
    headers["x-amz-meta-userId"] = user.id;
  } else {
    headers["x-amz-meta-author"] = user.id;
  }

  const res = await s3.s3.fetch(url, {
    method: "PUT",
    body: optimizedBuffer as unknown as BodyInit,
    headers,
  });

  if (!res.ok) {
    console.error("S3 Upload Error:", await res.text());
    throw new Error("Error al subir la imagen a S3");
  }

  return {
    key,
    url,
  };
}
