"use server";

import { desc, eq, gte } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable } from "@/db/schemas";
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

    // Construir where clause
    const whereClause = timeFilter
      ? gte(memesTable.createdAt, timeFilter)
      : undefined;

    // Construir order by clause
    const orderBy =
      sort === "hot"
        ? [desc(memesTable.likesCount), desc(memesTable.createdAt)]
        : [desc(memesTable.createdAt)];

    const memesData = await db.query.memesTable.findMany({
      where: whereClause,
      orderBy: orderBy,
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
        likes: userId
          ? {
              where: eq(likesTable.userId, userId),
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
  } catch (error) {
    console.error("[getHotMemes] Error:", error);
    return { memes: [] }; // Fallback
  }
}
