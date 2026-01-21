"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import { getMeme as getMemeDal } from "@/server/dal/memes";
import type { Meme } from "@/types/meme";

export async function getMeme(memeId: string): Promise<Meme | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const meme = await getMemeDal(memeId);

  if (!meme) return null;

  let isLiked = false;
  if (session?.user) {
    const likes = await getUserLikeds(session.user.id, [memeId]);
    isLiked = likes.length > 0;
  }

  return {
    id: meme.id,
    imageUrl: meme.imageUrl,
    title: meme.title,
    tags: meme.tags.map((mt) => mt.tag) || undefined,
    likesCount: meme.likesCount,
    commentsCount: meme.commentsCount,
    createdAt: meme.createdAt,
    isLiked,
    category: meme.category, // Added category passing if available in Meme type or DAL
    user: {
      id: meme.user.id,
      name: meme.user.name,
      image: meme.user.image,
    },
  };
}
