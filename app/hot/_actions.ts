"use server";

import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable, user as userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export async function getHotMemes({
  offset = 0,
  limit = 12,
  sort = "recent",
}: {
  offset?: number;
  limit?: number;
  sort?: "recent" | "hot";
}): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

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
