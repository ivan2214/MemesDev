"use server";
import { deleteObject } from "@better-upload/server/helpers";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { commentsTable, likesTable, memesTable } from "@/db/schemas";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import { s3 } from "@/lib/s3";
import type { Comment } from "@/types/comment";

export async function toggleLike(memeId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already liked
  const existingLike = await db.query.likesTable.findFirst({
    where: and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)),
  });

  if (existingLike) {
    // Unlike
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.memeId, memeId), eq(likesTable.userId, userId)));

    const meme = await db.query.memesTable.findFirst({
      where: eq(memesTable.id, memeId),
      columns: { likesCount: true },
    });

    if (meme) {
      await db
        .update(memesTable)
        .set({ likesCount: Math.max(0, meme.likesCount - 1) })
        .where(eq(memesTable.id, memeId));
    }

    return { liked: false };
  } else {
    // Like
    await db.insert(likesTable).values({
      memeId,
      userId,
    });

    const meme = await db.query.memesTable.findFirst({
      where: eq(memesTable.id, memeId),
      columns: { likesCount: true },
    });

    if (meme) {
      await db
        .update(memesTable)
        .set({ likesCount: meme.likesCount + 1 })
        .where(eq(memesTable.id, memeId));
    }

    return { liked: true };
  }
}

export async function getComments(
  memeId: string,
): Promise<{ comments: Comment[] }> {
  const comments = await db.query.commentsTable.findMany({
    where: eq(commentsTable.memeId, memeId),
    orderBy: desc(commentsTable.createdAt),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    columns: {
      id: true,
      content: true,
      createdAt: true,
    },
  });

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

  const meme = await db.query.memesTable.findFirst({
    where: eq(memesTable.id, memeId),
    columns: { commentsCount: true },
  });

  if (meme) {
    await db
      .update(memesTable)
      .set({ commentsCount: meme.commentsCount + 1 })
      .where(eq(memesTable.id, memeId));
  }

  revalidatePath(`/meme/${memeId}`);

  return { success: true, commentId: comment.id };
}

export async function deleteMeme(memeId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const meme = await db.query.memesTable.findFirst({
    where: eq(memesTable.id, memeId),
    columns: {
      id: true,
      userId: true,
      imageUrl: true,
      imageKey: true,
    },
  });

  if (!meme) {
    throw new Error("Meme not found");
  }

  if (meme.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await deleteObject(s3, {
    bucket: env.S3_BUCKET_NAME,
    key: meme.imageKey,
  });

  await db.delete(memesTable).where(eq(memesTable.id, memeId));

  revalidatePath(`/meme/${memeId}`);

  return { success: true };
}
