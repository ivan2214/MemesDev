"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { commentsTable, likesTable, memesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Comment } from "@/types/comment";

export async function getMeme(memeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const meme = await db.query.memesTable.findFirst({
    where: eq(memesTable.id, memeId),
    with: {
      user: true,
      likes: true, // we might not need all likes if we just check distinct count, but let's see logic below
    },
  });

  if (!meme) return null;

  const isLiked = session?.user
    ? meme.likes.some((like) => like.userId === session.user.id)
    : false;

  return {
    ...meme,
    isLiked,
    user: {
      id: meme.user.id,
      name: meme.user.name,
      image: meme.user.image,
    },
  };
}

export async function getComments(memeId: string) {
  const comments = await db.query.commentsTable.findMany({
    where: eq(commentsTable.memeId, memeId),
    with: {
      user: true,
    },
    orderBy: [desc(commentsTable.createdAt)],
  });

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    user: {
      id: comment.user.id,
      name: comment.user.name,
      image: comment.user.image,
    },
  }));
}

export async function toggleLikeMeme(memeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingLike = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)),
  });

  if (existingLike) {
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)));

    await db
      .update(memesTable)
      .set({
        likesCount: sql`${memesTable.likesCount} - 1`,
      })
      .where(eq(memesTable.id, memeId));

    // Revalidate paths if needed, specifically the meme page
    revalidatePath(`/meme/${memeId}`);
    return { liked: false };
  } else {
    await db.insert(likesTable).values({
      memeId,
      userId,
    });

    await db
      .update(memesTable)
      .set({
        likesCount: sql`${memesTable.likesCount} + 1`,
      })
      .where(eq(memesTable.id, memeId));

    revalidatePath(`/meme/${memeId}`);
    return { liked: true };
  }
}

export async function postComment(
  memeId: string,
  content: string,
): Promise<Comment> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [newComment] = await db
    .insert(commentsTable)
    .values({
      memeId,
      userId: session.user.id,
      content,
    })
    .returning();

  await db
    .update(memesTable)
    .set({
      commentsCount: sql`${memesTable.commentsCount} + 1`,
    })
    .where(eq(memesTable.id, memeId));

  revalidatePath(`/meme/${memeId}`);

  // Fetch the full comment with user details to return it
  const fullComment = await db.query.commentsTable.findFirst({
    where: eq(commentsTable.id, newComment.id),
    with: {
      user: true,
    },
  });

  if (!fullComment) throw new Error("Failed to fetch new comment");

  return {
    id: fullComment.id,
    content: fullComment.content,
    createdAt: fullComment.createdAt,
    user: {
      id: fullComment.user.id,
      name: fullComment.user.name,
      image: fullComment.user.image,
    },
  };
}
