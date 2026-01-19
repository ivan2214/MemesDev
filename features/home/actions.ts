"use server";

import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";

export async function getMemes(offset = 0, limit = 12) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

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
      isLiked: userId
        ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${userId})`
        : sql<boolean>`false`,
    })
    .from(memesTable)
    .innerJoin(userTable, eq(memesTable.userId, userTable.id))
    .orderBy(desc(memesTable.createdAt))
    .limit(limit)
    .offset(offset);

  return { memes };
}
