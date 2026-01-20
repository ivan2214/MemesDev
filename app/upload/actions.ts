"use server";

import { eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { categoriesTable, memesTable, user, userTagsTable } from "@/db/schemas";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
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
    // desconectar tags que se sacaron y conectar nuevos
    const oldTags = await db.query.userTagsTable.findMany({
      where: eq(userTagsTable.userId, session.user.id),
    });
    const tagsToDisconnect = oldTags.filter(
      (tag) => !tags?.some((t) => t.id === tag.tagId),
    );
    const tagsToConnect = tags.filter(
      (tag) => !oldTags.some((t) => t.tagId === tag.id),
    );
    // deconectar tags que se sacaron
    await db.delete(userTagsTable).where(
      inArray(
        userTagsTable.tagId,
        tagsToDisconnect.map((tag) => tag.tagId),
      ),
    );
    if (tagsToConnect.length > 0) {
      // conectar tags que se agregaron
      await db.insert(userTagsTable).values(
        tagsToConnect.map((tag) => ({
          userId: session.user.id,
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
        .update(user)
        .set({
          categoryId: null,
        })
        .where(eq(user.id, session.user.id));
    }
    const newCategory = await db.query.categoriesTable.findFirst({
      where: ilike(categoriesTable.name, category),
    });
    if (newCategory) {
      await db
        .update(user)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(user.id, session.user.id));
    } else {
      const [newCategory] = await db
        .insert(categoriesTable)
        .values({
          slug: category.toLowerCase().replace(" ", "-"),
          name: category,
        })
        .returning();
      await db
        .update(user)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(user.id, session.user.id));
    }
  }

  revalidatePath("/");
  revalidatePath("/hot");

  return { success: true, memeId: meme.id };
}
