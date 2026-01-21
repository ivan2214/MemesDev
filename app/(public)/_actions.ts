"use server";

import { getUserLikeds } from "@/server/dal/likes";
import { getRecentMemes } from "@/server/dal/memes";
import type { Meme } from "@/types/meme";

export async function getMemes(
  offset = 0,
  limit = 12,
  userId?: string,
): Promise<{ memes: Meme[] }> {
  const memesData = await getRecentMemes({ offset, limit, userId });

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
