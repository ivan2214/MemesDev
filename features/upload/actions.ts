"use server";

import { put } from "@vercel/blob";
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

  const file = formData.get("image") as File;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tags = formData.get("tags") as string;

  if (!file || !title) {
    throw new Error("Image and title are required");
  }

  // Upload to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
  });

  // Save to database
  const tagsArray = tags ? tags.split(",").map((t) => t.trim()) : [];

  const [meme] = await db
    .insert(memesTable)
    .values({
      userId: session.user.id,
      title,
      description: description || null,
      imageUrl: blob.url,
      tags: tagsArray,
    })
    .returning();

  revalidatePath("/");
  revalidatePath("/hot");

  return { success: true, memeId: meme.id };
}
