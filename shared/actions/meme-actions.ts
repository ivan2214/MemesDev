"use server";
import { deleteObject } from "@better-upload/server/helpers";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import {
  categoriesTable,
  commentsTable,
  likesTable,
  memesTable,
  memeTagsTable,
  notificationTable,
  tagsTable,
} from "@/db/schemas";
import { env } from "@/env/server";
import { s3 } from "@/lib/s3";
import { CACHE_TAGS } from "@/shared/constants";
import type { Comment } from "@/types/comment";

export async function toggleLike(memeId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    throw new Error("Unauthorized");
  }

  const userId = currentUser.id;

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

    updateTag(CACHE_TAGS.meme(memeId));
    updateTag(CACHE_TAGS.MEMES); // List might change order
    // Update user likes
    updateTag(`user-likes-${userId}`);

    return { liked: false };
  } else {
    // Like
    await db.insert(likesTable).values({
      memeId,
      userId,
    });

    const meme = await db.query.memesTable.findFirst({
      where: eq(memesTable.id, memeId),
      columns: { likesCount: true, title: true },
    });

    if (!meme) {
      throw new Error("Meme not found");
    }

    if (meme) {
      await db
        .update(memesTable)
        .set({ likesCount: meme.likesCount + 1 })
        .where(eq(memesTable.id, memeId));
    }

    // Enviar notificacion al usuario que recibio el like
    const memeOwner = await db.query.memesTable.findFirst({
      where: eq(memesTable.id, memeId),
      columns: { userId: true },
    });

    if (memeOwner && memeOwner.userId !== userId && meme) {
      const userLike = currentUser.username || currentUser.name || "un usuario";
      await db.insert(notificationTable).values({
        userId: memeOwner.userId,
        type: "like",
        message: `${userLike} le dio like a tu meme de ${meme.title}`,
        link: `${env.APP_URL}/meme/${memeId}`,
        read: false,
        from: userId,
      });
    }

    updateTag(CACHE_TAGS.meme(memeId));
    updateTag(CACHE_TAGS.MEMES);
    updateTag(`user-likes-${userId}`);

    return { liked: true };
  }
}

export async function getComments(
  memeId: string,
): Promise<{ comments: Comment[] }> {
  // Should this be moved to DAL?
  // For now, leaving it here as it is an action but it looks like a fetch.
  // Ideally fetches should be in DAL and actions call them.
  // But user said "Migrate shared/actions/meme-actions.ts to use DAL".
  // So I should move this logic to DAL and call it here?
  // Or just leave getComments here if it's used as a server action from client component (useEffect)?
  // Usually getComments is used in RSC.
  // If it is used in RSC, it should be in DAL.
  // If it is used in Client Component via Action, it can stay or call DAL.
  // I will leave logic here for now but use DB calls directly (or use DAL if created). (I haven't created comments DAL yet).

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
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    throw new Error("Unauthorized");
  }

  const [comment] = await db
    .insert(commentsTable)
    .values({
      memeId,
      userId: currentUser.id,
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

  updateTag(CACHE_TAGS.meme(memeId));
  updateTag(CACHE_TAGS.COMMENTS); // If we tag comments list

  return { success: true, commentId: comment.id };
}

export async function deleteMeme(memeId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
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

  if (meme.userId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  await deleteObject(s3, {
    bucket: env.S3_BUCKET_NAME,
    key: meme.imageKey,
  });

  await db.delete(memesTable).where(eq(memesTable.id, memeId));

  updateTag(CACHE_TAGS.meme(memeId));
  updateTag(CACHE_TAGS.MEMES);

  return { success: true };
}

import { getCurrentUser } from "@/data/user";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

type TagForForm = Omit<Tag, "createdAt" | "updatedAt">;

type CategoryForm = Omit<
  Category,
  "createdAt" | "updatedAt" | "icon" | "color"
>;

export async function uploadMeme({
  tags,
  imageKey,
  category,
  title,
}: {
  tags: TagForForm[] | null;
  imageKey: string;
  title?: string;
  category: CategoryForm | null;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    throw new Error("Unauthorized");
  }

  const imageUrl = `${env.S3_BUCKET_URL}/${imageKey}`;

  if (!imageUrl) {
    throw new Error("Image url is required");
  }

  const [meme] = await db
    .insert(memesTable)
    .values({
      userId: currentUser.id,
      imageUrl: imageUrl,
      imageKey,
      title,
    })
    .returning();

  if (tags && tags.length > 0) {
    // 1. Ensure all tags exist in DB and get their UUIDs
    const validTags = await Promise.all(
      tags.map(async (t) => {
        const existingTag = await db.query.tagsTable.findFirst({
          where: or(eq(tagsTable.slug, t.slug), eq(tagsTable.name, t.name)),
        });

        if (existingTag) {
          return existingTag;
        }

        const [tag] = await db
          .insert(tagsTable)
          .values({ name: t.name, slug: t.slug })
          .onConflictDoNothing()
          .returning();

        // If insert returned nothing (race condition conflict), try fetching again
        if (!tag) {
          const retryTag = await db.query.tagsTable.findFirst({
            where: or(eq(tagsTable.slug, t.slug), eq(tagsTable.name, t.name)),
          });
          if (retryTag) return retryTag;
          throw new Error("Failed to process tag");
        }

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
      where: eq(categoriesTable.slug, category.slug),
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
      where: ilike(categoriesTable.name, category.name),
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
          slug: category.slug,
          name: category.name,
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

  updateTag(CACHE_TAGS.MEMES);
  updateTag(CACHE_TAGS.TAGS); // Tags might have changed
  updateTag(CACHE_TAGS.CATEGORIES); // Categories might have changed

  return { success: true, memeId: meme.id };
}
