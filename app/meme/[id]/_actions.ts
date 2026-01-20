"use server";

import { eq } from "drizzle-orm";

import { headers } from "next/headers";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export async function getMeme(memeId: string): Promise<Meme | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const meme = await db.query.memesTable.findFirst({
    where: eq(memesTable.id, memeId),
    with: {
      user: true,
      likes: true,
    },
  });

  if (!meme) return null;

  const isLiked = session?.user
    ? meme.likes.some((like) => like.userId === session.user.id)
    : false;

  return {
    id: meme.id,
    imageUrl: meme.imageUrl,
    tags: meme.tags || undefined,
    likesCount: meme.likesCount,
    commentsCount: meme.commentsCount,
    createdAt: meme.createdAt,
    isLiked,
    user: {
      id: meme.user.id,
      name: meme.user.name,
      image: meme.user.image,
    },
  };
}
