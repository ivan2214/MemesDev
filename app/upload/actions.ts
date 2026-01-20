"use server";

import { and, eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  categoriesTable,
  memesTable,
  memeTagsTable,
  tagsTable,
} from "@/db/schemas";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import type { Category } from "@/types/category";
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

export async function searchCategories(query?: string): Promise<Category[]> {
  // If there's a search query, filter the categories
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    return db.query.categoriesTable.findMany({
      where: ilike(categoriesTable.name, `%${lowercaseQuery}%`),
    });
  }

  // Return first 10 users if no query
  return db.query.categoriesTable.findMany({
    limit: 10,
  });
}
