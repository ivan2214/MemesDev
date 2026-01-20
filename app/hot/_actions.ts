"use server";

import { desc, eq, gte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export type TimeRange = "24h" | "3d" | "7d" | "1m" | "3m" | "1y" | "all";

function getTimeFilter(timeRange: TimeRange): Date | null {
  const now = new Date();
  switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "3d":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

export async function getHotMemes({
  offset = 0,
  limit = 12,
  sort = "hot",
  timeRange = "24h",
}: {
  offset?: number;
  limit?: number;
  sort?: "recent" | "hot";
  timeRange?: TimeRange;
}): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    const timeFilter = getTimeFilter(timeRange);

    const query = db
      .select({
        meme: memesTable,
        user: {
          id: userTable.id,
          name: userTable.name,
        },
        liked: userId
          ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${userId})`
          : sql<boolean>`false`,
      })
      .from(memesTable)
      .innerJoin(userTable, eq(memesTable.userId, userTable.id))
      .offset(offset)
      .limit(limit);

    // Add time filter if not "all"
    if (timeFilter) {
      query.where(gte(memesTable.createdAt, timeFilter));
    }

    if (sort === "hot") {
      query.orderBy(
        desc(sql`${memesTable.likesCount} + ${memesTable.commentsCount} * 2`),
        desc(memesTable.createdAt),
      );
    } else {
      query.orderBy(desc(memesTable.createdAt));
    }

    const memes = await query;

    return {
      memes: memes.map(({ meme, user, liked }) => ({
        id: meme.id,
        imageUrl: meme.imageUrl,
        tags: meme.tags || undefined,
        likesCount: meme.likesCount,
        commentsCount: meme.commentsCount,
        createdAt: meme.createdAt,
        user: {
          id: user.id,
          name: user.name,
        },
        isLiked: liked,
      })),
    };
  } catch (error) {
    console.error("[getHotMemes] Error:", error);
    return { memes: [] }; // Fallback
  }
}
