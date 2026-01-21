"use server";

import { desc, eq, not } from "drizzle-orm";
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
    where: not(eq(memesTable.userId, userId || "")),
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
      likes: userId
        ? {
            where: eq(likesTable.userId, userId),
            columns: {
              userId: true,
            },
          }
        : undefined,
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
    isLiked: meme.likes?.length > 0,
  }));

  return { memes };
}
