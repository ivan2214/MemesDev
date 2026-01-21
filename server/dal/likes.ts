"use server";

import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";

// This function might NOT be cached if we want real-time likes,
// OR we cache it per user (passed as arg).
// Since 'use cache' caches based on arguments, passing userId works.
export async function getUserLikeds(userId: string, memeIds: string[]) {
  "use cache";
  cacheTag(CACHE_TAGS.LIKES, `user-likes-${userId}`);
  cacheLife(CACHE_LIFE.SHORT); // Likes might change often locally, but we updateTag on mutation.

  if (memeIds.length === 0) return [];

  const likes = await db.query.likesTable.findMany({
    where: (table, { and, eq, inArray }) =>
      and(eq(table.userId, userId), inArray(table.memeId, memeIds)),
    columns: {
      memeId: true,
    },
  });

  return likes.map((l) => l.memeId);
}
