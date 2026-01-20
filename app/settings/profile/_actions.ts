"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { tagsTable } from "@/db/schemas";
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

  const image = env.S3_BUCKET_URL + validatedFields.imageKey;

  await db
    .update(user)
    .set({
      name: validatedFields.name,
      bio: validatedFields.bio,
      image,
      category: validatedFields.category,
      socials: validatedFields.socials,
    })
    .where(eq(user.id, session.user.id));

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
  });

  return userData;
}
