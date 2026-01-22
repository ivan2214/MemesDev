import "server-only";

import { count, desc, eq } from "drizzle-orm";
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

  // Obtener usuarios con sus memes, tags y categoría usando métodos de Drizzle
  const usersWithMemes = await db.query.user.findMany({
    with: {
      memes: {
        columns: {
          likesCount: true,
          commentsCount: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
      category: true,
    },
    limit: 50, // Limitar para después filtrar los mejores
  });

  // Calcular totales y ordenar por engagement
  const creatorsWithStats = usersWithMemes.map((user) => {
    const totalMemes = user.memes.length;
    const totalLikes = user.memes.reduce(
      (acc, meme) => acc + (meme.likesCount ?? 0),
      0,
    );
    const totalComments = user.memes.reduce(
      (acc, meme) => acc + (meme.commentsCount ?? 0),
      0,
    );
    const engagement = totalLikes + totalComments;

    return {
      ...user,
      tags: user.tags.map((t) => t.tag),
      totalMemes,
      totalLikes,
      totalComments,
      engagement,
    };
  });

  // Ordenar por engagement y tomar los top 10
  return creatorsWithStats
    .sort((a, b) => b.engagement - a.engagement)
    .map(({ memes: _memes, engagement: _engagement, ...rest }) => rest);
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
