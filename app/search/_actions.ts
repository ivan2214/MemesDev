"use server";

import { desc, eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export type SortType = "recent" | "likes" | "comments";

export async function getMemes({
  query = "",
  offset = 0,
  limit = 12,
  sort = "recent",
}: {
  query?: string;
  offset?: number;
  limit?: number;
  sort?: SortType;
}): Promise<{ memes: Meme[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const baseQuery = db
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
    .limit(limit)
    .offset(offset);

  // Add search filter if query exists
  if (query.trim()) {
    const searchPattern = `%${query}%`;
    baseQuery.where(
      or(
        sql`EXISTS (SELECT 1 FROM unnest(${memesTable.tags}) AS tag WHERE tag ILIKE ${searchPattern})`,
      ),
    );
  }

  // Apply sorting
  switch (sort) {
    case "likes":
      baseQuery.orderBy(
        desc(memesTable.likesCount),
        desc(memesTable.createdAt),
      );
      break;
    case "comments":
      baseQuery.orderBy(
        desc(memesTable.commentsCount),
        desc(memesTable.createdAt),
      );
      break;
    case "recent":
    default:
      baseQuery.orderBy(desc(memesTable.createdAt));
      break;
  }

  const memes = await baseQuery;
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

// Keep for backward compatibility
export async function searchMemes(
  query: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  return getMemes({ query, offset, limit, sort: "recent" });
}
