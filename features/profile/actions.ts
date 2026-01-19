"use server";

import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { commentsTable, likesTable, memesTable, userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";

export async function getUserProfile(userId: string) {
  const users = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!users[0]) {
    return { user: null, stats: null };
  }

  // Get stats
  const memesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(memesTable)
    .where(eq(memesTable.userId, userId));

  const likesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(likesTable)
    .where(eq(likesTable.userId, userId));

  const commentsCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(commentsTable)
    .where(eq(commentsTable.userId, userId));

  const stats = {
    memesCount: Number(memesCount[0]?.count || 0),
    likesCount: Number(likesCount[0]?.count || 0),
    commentsCount: Number(commentsCountResult[0]?.count || 0),
  };

  return { user: users[0], stats };
}

export async function getUserMemes(userId: string, offset = 0, limit = 12) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const memes = await db
    .select({
      id: memesTable.id,
      title: memesTable.title,
      description: memesTable.description,
      imageUrl: memesTable.imageUrl,
      tags: memesTable.tags,
      likesCount: memesTable.likesCount,
      commentsCount: memesTable.commentsCount,
      createdAt: memesTable.createdAt,
      userId: userTable.id,
      userName: userTable.name,
      isLiked: currentUserId
        ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${currentUserId})`
        : sql<boolean>`false`,
    })
    .from(memesTable)
    .innerJoin(userTable, eq(memesTable.userId, userTable.id))
    .where(eq(memesTable.userId, userId))
    .orderBy(desc(memesTable.createdAt))
    .limit(limit)
    .offset(offset);

  return { memes };
}

export async function getUserLikedMemes(
  userId: string,
  offset = 0,
  limit = 12,
) {
  const memes = await db
    .select({
      id: memesTable.id,
      title: memesTable.title,
      description: memesTable.description,
      imageUrl: memesTable.imageUrl,
      tags: memesTable.tags,
      likesCount: memesTable.likesCount,
      commentsCount: memesTable.commentsCount,
      createdAt: memesTable.createdAt,
      userId: userTable.id,
      userName: userTable.name,
      isLiked: sql<boolean>`true`,
    })
    .from(memesTable)
    .innerJoin(userTable, eq(memesTable.userId, userTable.id))
    .innerJoin(likesTable, eq(likesTable.memeId, memesTable.id))
    .where(eq(likesTable.userId, userId))
    .orderBy(desc(likesTable.createdAt))
    .limit(limit)
    .offset(offset);

  return { memes };
}
