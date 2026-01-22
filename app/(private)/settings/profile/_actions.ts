"use server";

import { eq, ilike, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { getCurrentUser } from "@/data/user";
import { db } from "@/db";
import { categoriesTable, userTagsTable } from "@/db/schemas"; // Added tagsTable
import { user as userTable } from "@/db/schemas/auth-schema";
import { env } from "@/env/server";
import { CACHE_TAGS } from "@/shared/constants";
import { type ProfileSchema, profileSchema } from "./_validators";

export async function updateProfile(data: ProfileSchema) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) {
    throw new Error("No estás autorizado para realizar esta acción");
  }

  const currentUserId = currentUser.id;

  const validatedFields = profileSchema.parse(data);

  const imageURLForS3 = validatedFields.imageKey
    ? `${env.S3_BUCKET_URL}/${validatedFields.imageKey}`
    : undefined;

  await db
    .update(userTable)
    .set({
      name: validatedFields.name,
      bio: validatedFields.bio,
      socials: validatedFields.socials,
      ...(imageURLForS3
        ? { imageKey: validatedFields.imageKey, image: imageURLForS3 }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, currentUserId));

  if (validatedFields.tags && validatedFields.tags.length > 0) {
    // desconectar tags que se sacaron y conectar nuevos
    const oldTags = await db.query.userTagsTable.findMany({
      where: eq(userTagsTable.userId, currentUserId),
    });
    const tagsToDisconnect = oldTags.filter(
      (tag) => !validatedFields.tags?.some((t) => t.id === tag.tagId),
    );
    const tagsToConnect = validatedFields.tags.filter(
      (tag) => !oldTags.some((t) => t.tagId === tag.id),
    );
    // deconectar tags que se sacaron
    if (tagsToDisconnect.length > 0) {
      await db.delete(userTagsTable).where(
        inArray(
          userTagsTable.tagId,
          tagsToDisconnect.map((tag) => tag.tagId),
        ),
      );
    }
    if (tagsToConnect.length > 0) {
      // conectar tags que se agregaron
      await db.insert(userTagsTable).values(
        tagsToConnect.map((tag) => ({
          userId: currentUserId as string,
          tagId: tag.id,
        })),
      );
    }
  }

  if (validatedFields.category) {
    const oldCategory = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.slug, validatedFields.category.slug),
    });
    // desconectar categoría que se sacó
    if (oldCategory) {
      // Logic for oldCategory seems redundant if we overwrite below, but keeping logic structure
      // Wait, the logic below checks if category exists, if not creates. Then sets categoryId.
    }
    const newCategory = await db.query.categoriesTable.findFirst({
      where: ilike(categoriesTable.name, validatedFields.category.name),
    });
    if (newCategory) {
      await db
        .update(userTable)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(userTable.id, currentUserId));
    } else {
      const [createdCategory] = await db
        .insert(categoriesTable)
        .values({
          slug: validatedFields.category.slug,
          name: validatedFields.category.name,
        })
        .returning();
      await db
        .update(userTable)
        .set({
          categoryId: createdCategory.id,
        })
        .where(eq(userTable.id, currentUserId));
    }
  }

  updateTag(CACHE_TAGS.user(currentUserId));

  return { success: true };
}
