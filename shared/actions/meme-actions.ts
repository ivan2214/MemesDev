"use server";
import { deleteObject } from "@better-upload/server/helpers";

import { and, desc, eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  categoriesTable,
  commentsTable,
  likesTable,
  memesTable,
  memeTagsTable,
  tagsTable,
} from "@/db/schemas";
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

import type { Tag } from "@/types/tag";

type TagForForm = Omit<Tag, "createdAt" | "updatedAt">;

export async function uploadMeme({
  tags,
  imageKey,
  category,
  title,
}: {
  tags: TagForForm[];
  imageKey: string;
  title?: string;
  category?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const imageUrl = `${env.S3_BUCKET_URL}/${imageKey}`;

  console.log("imageUrl", imageUrl);

  if (!imageUrl) {
    throw new Error("Image url is required");
  }

  const [meme] = await db
    .insert(memesTable)
    .values({
      userId: session.user.id,
      imageUrl: imageUrl,
      imageKey,
      title,
    })
    .returning();

  if (tags && tags.length > 0) {
    // 1. Ensure all tags exist in DB and get their UUIDs
    const validTags = await Promise.all(
      tags.map(async (t) => {
        const [tag] = await db
          .insert(tagsTable)
          .values({ name: t.name, slug: t.slug })
          .onConflictDoUpdate({
            target: tagsTable.slug,
            set: { name: t.name },
          })
          .returning();
        return tag;
      }),
    );

    // 2. Fetch existing relations for this meme (should be empty for new meme, but good for robustness)
    const currentMemeTags = await db.query.memeTagsTable.findMany({
      where: eq(memeTagsTable.memeId, meme.id),
    });

    // 3. Calculate diff
    const tagIdsToKeep = new Set(validTags.map((t) => t.id));
    const currentTagIds = new Set(currentMemeTags.map((t) => t.tagId));

    const tagsToDisconnect = currentMemeTags.filter(
      (t) => !tagIdsToKeep.has(t.tagId),
    );
    const tagsToConnect = validTags.filter((t) => !currentTagIds.has(t.id));

    // 4. Execute updates
    if (tagsToDisconnect.length > 0) {
      await db.delete(memeTagsTable).where(
        and(
          eq(memeTagsTable.memeId, meme.id),
          inArray(
            memeTagsTable.tagId,
            tagsToDisconnect.map((tag) => tag.tagId),
          ),
        ),
      );
    }

    if (tagsToConnect.length > 0) {
      await db.insert(memeTagsTable).values(
        tagsToConnect.map((tag) => ({
          memeId: meme.id,
          tagId: tag.id,
        })),
      );
    }
  }

  if (category) {
    const oldCategory = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.slug, category),
    });
    // desconectar categoría que se sacó
    if (oldCategory) {
      await db
        .update(memesTable)
        .set({
          categoryId: null,
        })
        .where(eq(memesTable.id, meme.id));
    }
    const newCategory = await db.query.categoriesTable.findFirst({
      where: ilike(categoriesTable.name, category),
    });
    if (newCategory) {
      await db
        .update(memesTable)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(memesTable.id, meme.id));
    } else {
      const [newCategory] = await db
        .insert(categoriesTable)
        .values({
          slug: category.toLowerCase().replace(" ", "-"),
          name: category,
        })
        .returning();
      await db
        .update(memesTable)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(memesTable.id, meme.id));
    }
  }

  revalidatePath("/");
  revalidatePath("/hot");

  return { success: true, memeId: meme.id };
}
