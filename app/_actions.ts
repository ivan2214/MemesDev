"use server";

import { desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable, memesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export async function getMemes(
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const memesData = await db.query.memesTable.findMany({
    orderBy: [desc(memesTable.createdAt)],
    limit,
    offset,
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
      category: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
    extras: {
      isLiked: userId
        ? sql<boolean>`EXISTS(SELECT 1 FROM ${likesTable} WHERE ${likesTable.memeId} = ${memesTable.id} AND ${likesTable.userId} = ${userId})`.as(
            "isLocked",
          )
        : sql<boolean>`false`.as("isLiked"),
    },
  });

  // Transformar resultado para coincidir con el tipo Meme
  const memes: Meme[] = memesData.map((meme) => ({
    id: meme.id,
    imageUrl: meme.imageUrl,
    title: meme.title,
    category: meme.category,
    tags: meme.tags.map((mt) => mt.tag),
    likesCount: meme.likesCount,
    commentsCount: meme.commentsCount,
    createdAt: meme.createdAt,
    user: meme.user,
    isLiked: meme.isLiked,
  }));

  return { memes };
}
