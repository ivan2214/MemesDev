"use server";

import { count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";
import type { UserProfile } from "@/types/profile";

export async function getUserProfile(userId: string) {
  "use cache";
  cacheTag(CACHE_TAGS.USERS, CACHE_TAGS.user(userId));
  cacheLife(CACHE_LIFE.DEFAULT);

  const userRecord = await db.query.user.findFirst({
    where: eq(userTable.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      bio: true,
      socials: true,
    },
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
      category: true,
    },
  });

  if (!userRecord) {
    return null;
  }

  // Get stats
  // Note: Caching stats might mean they are slightly outdated. Acceptable.
  const memesCount = await db
    .select({ count: count() })
    .from(memesTable)
    .where(eq(memesTable.userId, userId));

  const likesCount = await db
    .select({ count: count() })
    .from(likesTable)
    .where(eq(likesTable.userId, userId));

  const stats = {
    memesCount: memesCount[0]?.count || 0,
    likesCount: likesCount[0]?.count || 0,
  };

  const user: UserProfile = {
    ...userRecord,
    memesCount: stats.memesCount,
    totalLikes: stats.likesCount,
    tags: userRecord.tags.map((tag) => tag.tag),
  };

  return user;
}

export async function getUserMemesDal({
  userId,
  offset = 0,
  limit = 12,
}: {
  userId: string;
  offset?: number;
  limit?: number;
}) {
  "use cache";
  cacheTag(CACHE_TAGS.MEMES, `user-memes-${userId}`);
  cacheLife(CACHE_LIFE.SHORT); // User might post frequent

  return await db.query.memesTable.findMany({
    where: eq(memesTable.userId, userId),
    orderBy: desc(memesTable.createdAt),
    limit,
    offset,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });
}

export const getTrendCreators = async () => {
  "use cache";
  cacheTag(CACHE_TAGS.USERS_TREND);
  cacheLife(CACHE_LIFE.DEFAULT);

  const trendCreators = await db.query.user.findMany({
    orderBy: desc(userTable.createdAt),
    limit: 5,
  });

  return trendCreators;
};
