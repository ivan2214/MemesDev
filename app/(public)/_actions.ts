"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import { getRecentMemes } from "@/server/dal/memes";
import type { Meme } from "@/types/meme";

export async function getMemes(
  offset = 0,
  limit = 12,
  skipAuth = false,
): Promise<{ memes: Meme[] }> {
  const session = skipAuth
    ? null
    : await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const memesData = await getRecentMemes({ offset, limit });

  if (memesData.length === 0) {
    return { memes: [] };
  }

  let likedMemeIds = new Set<string>();
  if (userId) {
    const likes = await getUserLikeds(
      userId,
      memesData.map((m) => m.id),
    );
    likedMemeIds = new Set(likes);
  }

  // Transformar resultado para coincidir con el tipo Meme
  const memes: Meme[] = memesData.map((meme) => ({
    id: meme.id,
    imageUrl: meme.imageUrl,
    title: meme.title,
    category: meme.category,
    tags: meme.tags.map((mt) => mt.tag),
    likesCount: meme.likesCount,
    commentsCount: meme.commentsCount,
    createdAt: meme.createdAt,
    user: meme.user,
    isLiked: likedMemeIds.has(meme.id),
  }));

  return { memes };
}
