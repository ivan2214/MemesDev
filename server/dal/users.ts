import "server-only";

import { count, desc, eq, inArray, sql, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentUser } from "@/data/user";
import { db } from "@/db";
import {
  likesTable,
  memesTable,
  notificationTable,
  user as userTable,
} from "@/db/schemas";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";
import type { TrendCreator } from "@/shared/types";
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

export const getTrendCreators = async (): Promise<TrendCreator[]> => {
  "use cache";
  cacheTag(CACHE_TAGS.USERS_TREND);
  cacheLife(CACHE_LIFE.DEFAULT);

  // Paso 1: Obtener los IDs de los top creadores ordenados por engagement en la BD
  const topCreatorsQuery = await db
    .select({
      id: userTable.id,
      totalMemes: count(memesTable.id),
      totalLikes: sum(memesTable.likesCount).mapWith(Number),
      totalComments: sum(memesTable.commentsCount).mapWith(Number),
    })
    .from(userTable)
    .leftJoin(memesTable, eq(memesTable.userId, userTable.id))
    .groupBy(userTable.id)
    .orderBy(
      desc(
        sql`${sum(memesTable.likesCount)} + ${sum(memesTable.commentsCount)}`,
      ),
    )
    .limit(5);

  if (topCreatorsQuery.length === 0) {
    return [];
  }

  const topCreatorIds = topCreatorsQuery.map((c) => c.id);

  // Paso 2: Obtener los usuarios con sus relaciones (tags y category)
  const usersWithRelations = await db.query.user.findMany({
    where: inArray(userTable.id, topCreatorIds),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
      category: true,
    },
  });

  // Paso 3: Usar Map para lookup O(1) en lugar de find() O(n)
  const usersMap = new Map(usersWithRelations.map((u) => [u.id, u]));
  const statsMap = new Map(
    topCreatorsQuery.map((c) => [
      c.id,
      {
        totalMemes: c.totalMemes,
        totalLikes: c.totalLikes ?? 0,
        totalComments: c.totalComments ?? 0,
      },
    ]),
  );

  // Ordenar usuarios según el orden de topCreatorIds y añadir stats - O(n)
  const trendCreators = topCreatorIds
    .map((id) => {
      const user = usersMap.get(id);
      const stats = statsMap.get(id);

      if (!user || !stats) return null;

      return {
        ...user,
        tags: user.tags.map((t) => t.tag),
        ...stats,
      };
    })
    .filter(
      (creator): creator is NonNullable<typeof creator> => creator !== null,
    );

  return trendCreators;
};

export const getNotifications = async () => {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    return [];
  }

  const userId = user.id;

  const notifications = await db.query.notificationTable.findMany({
    where: eq(notificationTable.userId, userId),
    orderBy: desc(notificationTable.createdAt),
  });

  return notifications;
};
