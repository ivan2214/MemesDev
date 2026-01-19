"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { commentsTable, likesTable, memesTable, userTable } from "@/db/schemas";
import { auth } from "@/lib/auth";

export async function toggleLike(memeId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already liked
  const existingLike = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)))
    .limit(1);

  if (existingLike.length > 0) {
    // Unlike
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)));

    await db
      .update(memesTable)
      .set({ likesCount: sql`${memesTable.likesCount} - 1` })
      .where(eq(memesTable.id, memeId));

    return { liked: false };
  } else {
    // Like
    await db.insert(likesTable).values({
      memeId,
      userId,
    });

    await db
      .update(memesTable)
      .set({ likesCount: sql`${memesTable.likesCount} + 1` })
      .where(eq(memesTable.id, memeId));

    return { liked: true };
  }
}

export async function getMemeDetails(memeId: string) {
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
      userImage: userTable.image,
      isLiked: userId
        ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${userId})`
        : sql<boolean>`false`,
    })
    .from(memesTable)
    .innerJoin(userTable, eq(memesTable.userId, userTable.id))
    .where(eq(memesTable.id, memeId))
    .limit(1);

  return { meme: memes[0] || null };
}

export async function getComments(memeId: string) {
  const comments = await db
    .select({
      id: commentsTable.id,
      content: commentsTable.content,
      createdAt: commentsTable.createdAt,
      userId: userTable.id,
      userName: userTable.name,
      userImage: userTable.image,
    })
    .from(commentsTable)
    .innerJoin(userTable, eq(commentsTable.userId, userTable.id))
    .where(eq(commentsTable.memeId, memeId))
    .orderBy(desc(commentsTable.createdAt));

  return { comments };
}

export async function addComment(memeId: string, content: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({
      memeId,
      userId: session.user.id,
      content,
    })
    .returning();

  await db
    .update(memesTable)
    .set({ commentsCount: sql`${memesTable.commentsCount} + 1` })
    .where(eq(memesTable.id, memeId));

  revalidatePath(`/meme/${memeId}`);

  return { success: true, commentId: comment.id };
}
