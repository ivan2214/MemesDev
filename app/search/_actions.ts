"use server";

import { desc, eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export async function searchMemes(
  query: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const searchPattern = `%${query}%`;

  const memes = await db
    .select({
      id: memesTable.id,
      imageUrl: memesTable.imageUrl,
      tags: memesTable.tags,
      likesCount: memesTable.likesCount,
      commentsCount: memesTable.commentsCount,
      createdAt: memesTable.createdAt,
      user: {
        id: userTable.id,
        name: userTable.name,
      },
      isLiked: userId
        ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${userId})`
        : sql<boolean>`false`,
    })
    .from(memesTable)
    .innerJoin(userTable, eq(memesTable.userId, userTable.id))
    .where(
      or(
        sql`EXISTS (SELECT 1 FROM unnest(${memesTable.tags}) AS tag WHERE tag ILIKE ${searchPattern})`,
      ),
    )
    .orderBy(desc(memesTable.createdAt))
    .limit(limit)
    .offset(offset);

  return { memes };
}

export async function getAllTags(): Promise<{ tags: string[] }> {
  const result = await db
    .selectDistinct({
      tag: sql<string>`unnest(${memesTable.tags})`,
    })
    .from(memesTable)
    .where(sql`${memesTable.tags} IS NOT NULL`);

  const tags = result
    .map((r) => r.tag)
    .filter((tag): tag is string => tag !== null && tag !== "");

  return { tags: [...new Set(tags)].sort() };
}
