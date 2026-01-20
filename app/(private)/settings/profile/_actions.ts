"use server";

import { eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { categoriesTable, userTagsTable } from "@/db/schemas";
import { user } from "@/db/schemas/auth-schema";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import type { UserSettings } from "./_types";
import { type ProfileSchema, profileSchema } from "./_validators";

export async function updateProfile(data: ProfileSchema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("No estás autorizado para realizar esta acción");
  }

  const validatedFields = profileSchema.parse(data);

  const imageURLForS3 = `${env.S3_BUCKET_URL}/${validatedFields.imageKey}`;

  await db
    .update(user)
    .set({
      name: validatedFields.name,
      bio: validatedFields.bio,
      socials: validatedFields.socials,
    })
    .where(eq(user.id, session.user.id));

  if (validatedFields.imageKey) {
    console.log("imageKey", validatedFields.imageKey);
    console.log("imageURLForS3", imageURLForS3);
    await db
      .update(user)
      .set({ imageKey: validatedFields.imageKey, image: imageURLForS3 })
      .where(eq(user.id, session.user.id));
  }

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

  if (validatedFields.category) {
    const oldCategory = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.slug, validatedFields.category),
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
      where: ilike(categoriesTable.name, validatedFields.category),
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
          slug: validatedFields.category.toLowerCase().replace(" ", "-"),
          name: validatedFields.category,
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

  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath("/settings/profile");

  return { success: true };
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  const userData = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
    with: {
      category: true,
    },
  });

  if (!userData) {
    return null;
  }

  const userTags = await db.query.userTagsTable.findMany({
    where: eq(userTagsTable.userId, session.user.id),
    with: {
      tag: true,
    },
  });

  return {
    ...userData,
    tags: userTags.map((tag) => tag.tag),
    category: userData?.category,
  };
}
