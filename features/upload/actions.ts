"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";

export async function uploadMeme(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const tags = formData.get("tags") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!imageUrl) {
    throw new Error("Image is required");
  }

  // Upload to meme

  // Save to database
  const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : [];

  const [meme] = await db
    .insert(memesTable)
    .values({
      userId: session.user.id,
      imageUrl: imageUrl,
      tags: tagsArray,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/hot");

  return { success: true, memeId: meme.id };
}
