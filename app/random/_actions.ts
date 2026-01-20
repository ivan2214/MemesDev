"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { likesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme } from "@/types/meme";

export async function getRandomMemes(limit = 8): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    const memesData = await db.query.memesTable.findMany({
      orderBy: (memes, { desc }) => [desc(memes.createdAt)],
      limit: 50, // Fetch more to shuffle on client side
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

    const shuffled = memesData.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, limit);

    const memes: Meme[] = selected.map((meme) => ({
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
  } catch (error) {
    console.error("[getRandomMemes] Error:", error);
    return { memes: [] };
  }
}
