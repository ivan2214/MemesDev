"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import {
  getHotMemes as getHotMemesDal,
  type TimeRange,
} from "@/server/dal/memes";
import type { Meme } from "@/types/meme";

// export type { TimeRange }; // Removed to avoid build error

export async function getHotMemes({
  offset = 0,
  limit = 12,
  sort = "hot",
  timeRange = "24h",
  skipAuth = false,
}: {
  offset?: number;
  limit?: number;
  sort?: "recent" | "hot";
  timeRange?: TimeRange;
  skipAuth?: boolean;
}): Promise<{ memes: Meme[] }> {
  try {
    const session = skipAuth
      ? null
      : await auth.api.getSession({
          headers: await headers(),
        });
    const userId = session?.user?.id;

    const memesData = await getHotMemesDal({
      offset,
      limit,
      sort,
      timeRange,
    });

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
  } catch (error) {
    console.error("[getHotMemes] Error:", error);
    return { memes: [] }; // Fallback
  }
}
