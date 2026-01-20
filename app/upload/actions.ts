"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";

export async function uploadMeme({
  tags,
  imageKey,
}: {
  tags: string[];
  imageKey: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const imageUrl = `${env.S3_BUCKET_URL}/${imageKey}`;

  console.log("imageUrl", imageUrl);

  if (!imageUrl) {
    throw new Error("Image url is required");
  }

  // Upload to meme

  // Save to database

  const [meme] = await db
    .insert(memesTable)
    .values({
      userId: session.user.id,
      imageUrl: imageUrl,
      tags,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/hot");

  return { success: true, memeId: meme.id };
}
