"use server";

import { eq, ilike, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireUser } from "@/data/user";
import { db } from "@/db";
import { categoriesTable, userTagsTable } from "@/db/schemas";
import { user as userTable } from "@/db/schemas/auth-schema";
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
    .update(userTable)
    .set({
      name: validatedFields.name,
      bio: validatedFields.bio,
      socials: validatedFields.socials,
    })
    .where(eq(userTable.id, session.user.id));

  if (validatedFields.imageKey) {
    
    await db
      .update(userTable)
      .set({ imageKey: validatedFields.imageKey, image: imageURLForS3 })
      .where(eq(userTable.id, session.user.id));
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
      where: eq(categoriesTable.slug, validatedFields.category.slug),
    });
    // desconectar categoría que se sacó
    if (oldCategory) {
      await db
        .update(userTable)
        .set({
          categoryId: null,
        })
        .where(eq(userTable.id, session.user.id));
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
      const [newCategory] = await db
        .insert(categoriesTable)
        .values({
          slug: validatedFields.category.slug,
          name: validatedFields.category.name,
        })
        .returning();
      await db
        .update(userTable)
        .set({
          categoryId: newCategory.id,
        })
        .where(eq(userTable.id, session.user.id));
    }
  }

  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath("/settings/profile");

  return { success: true };
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const user = await requireUser();

  const userData = await db.query.user.findFirst({
    where: eq(userTable.id, user.id),
    with: {
      category: true,
    },
  });

  if (!userData) {
    return null;
  }

  const userTags = await db.query.userTagsTable.findMany({
    where: eq(userTagsTable.userId, user.id),
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
