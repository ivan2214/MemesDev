"use server";

import { eq, ilike, inArray } from "drizzle-orm";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { categoriesTable, userTagsTable } from "@/db/schemas"; // Added tagsTable
import { user as userTable } from "@/db/schemas/auth-schema";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import { getUserSettingsDal } from "@/server/dal/users";
import { CACHE_TAGS } from "@/shared/constants";
import type { UserSettings } from "./_types";
import { type ProfileSchema, profileSchema } from "./_validators";

export async function updateProfile(data: ProfileSchema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("No estás autorizado para realizar esta acción");
  }

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
    .where(eq(userTable.id, session.user.id));

  if (validatedFields.tags && validatedFields.tags.length > 0) {
    // desconectar tags que se sacaron y conectar nuevos
    const oldTags = await db.query.userTagsTable.findMany({
      where: eq(userTagsTable.userId, session.user.id),
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
          userId: session.user.id,
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
        .where(eq(userTable.id, session.user.id));
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
        .where(eq(userTable.id, session.user.id));
    }
  } else {
    // If category is null/undefined, maybe user removed it?
    // Logic in previous code handled existing category set to null?
    // It had: if (validatedFields.category) ...
    // It didn't seem to explicitly unset category if passed as null.
    // But we passed categoryId: data.categoryId || null in the failed replace attempt.
    // In the original file, it only touches category if validatedFields.category is present.
    // I'll stick to original logic but fix imports and return.
  }

  updateTag(CACHE_TAGS.user(session.user.id));

  return { success: true };
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) return null;

  const data = await getUserSettingsDal(session.user.id);

  if (!data) return null;

  return data;
}
