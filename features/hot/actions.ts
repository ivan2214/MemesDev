"use server";

import { and, desc, eq, sql } from "drizzle-orm";
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

export async function toggleLikeMeme(memeId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)));

    let liked = false;
    let newLikesCount = 0;

    await db.transaction(async (tx) => {
      if (existingLike) {
        // Unlike
        await tx
          .delete(likesTable)
          .where(
            and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)),
          );

        const [updatedMeme] = await tx
          .update(memesTable)
          .set({
            likesCount: sql`${memesTable.likesCount} - 1`,
          })
          .where(eq(memesTable.id, memeId))
          .returning({ likesCount: memesTable.likesCount });

        newLikesCount = updatedMeme.likesCount;
        liked = false;
      } else {
        // Like
        await tx.insert(likesTable).values({
          memeId,
          userId,
        });

        const [updatedMeme] = await tx
          .update(memesTable)
          .set({
            likesCount: sql`${memesTable.likesCount} + 1`,
          })
          .where(eq(memesTable.id, memeId))
          .returning({ likesCount: memesTable.likesCount });

        newLikesCount = updatedMeme.likesCount;
        liked = true;
      }
    });

    return { liked, likes_count: newLikesCount };
  } catch (error) {
    console.error("[toggleLikeMeme] Error:", error);
    throw error;
  }
}
