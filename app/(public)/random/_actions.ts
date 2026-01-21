"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import { getRecentMemes } from "@/server/dal/memes";
import type { Meme } from "@/types/meme";

export async function getRandomMemes(
  limit = 8,
  skipAuth = false,
): Promise<{ memes: Meme[] }> {
  try {
    const session = skipAuth
      ? null
      : await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Fetch 50 most recent (cached)
    const memesData = await getRecentMemes({ limit: 50 });

    if (memesData.length === 0) {
      return { memes: [] };
    }

    // Shuffle
    const shuffled = [...memesData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    let likedMemeIds = new Set<string>();
    if (userId) {
      const likes = await getUserLikeds(
        userId,
        selected.map((m) => m.id),
      );
      likedMemeIds = new Set(likes);
    }

    const memes: Meme[] = selected.map((meme) => ({
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
  } catch (error) {
    console.error("[getRandomMemes] Error:", error);
    return { memes: [] };
  }
}
