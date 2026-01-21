"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAllTags as getAllTagsDal } from "@/server/dal/categories"; // Assuming tags also in DAL or create tags DAL
// I put getAllTags in `server/dal/categories.ts` (misnamed maybe but grouping static data)
import { getUserLikeds } from "@/server/dal/likes";
import { searchMemesDal } from "@/server/dal/memes";
import type { Meme } from "@/types/meme";
import type { Tag } from "@/types/tag";

export type SortType = "recent" | "likes" | "comments";

export async function getMemes({
  query = "",
  tags = [],
  category = "",
  offset = 0,
  limit = 12,
  sort = "recent",
}: {
  query?: string;
  tags?: string[];
  category?: string;
  offset?: number;
  limit?: number;
  sort?: SortType;
}): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    const memesData = await searchMemesDal({
      query,
      tags,
      category,
      offset,
      limit,
      sort,
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
    console.error("[searchMemes] Error:", error);
    return { memes: [] };
  }
}

export async function getAllTags(): Promise<{ tags: Tag[] }> {
  const tags = await getAllTagsDal();
  return { tags };
}

// Actualizar también la compatibilidad
export async function searchMemes(
  query: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  return getMemes({ query, offset, limit, sort: "recent" });
}
