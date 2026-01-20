"use server";

import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";
import type { UserProfile } from "@/types/profile";

export async function getUserProfile(userId: string): Promise<{
  user?: UserProfile | null;
}> {
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
    return { user: null };
  }

  // Get stats
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

  return { user };
}

export async function getUserMemes(
  userId: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const memesData = await db.query.memesTable.findMany({
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
      likes: currentUserId
        ? {
            where: eq(likesTable.userId, currentUserId),
            columns: {
              userId: true,
            },
          }
        : undefined,
    },
  });

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
    isLiked: meme.likes?.length > 0,
  }));

  return { memes };
}
