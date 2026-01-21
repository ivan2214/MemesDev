"use server";

import { inArray, not } from "drizzle-orm";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { getUserLikeds } from "@/server/dal/likes";
import type { Meme } from "@/types/meme";

export async function getRandomMemes(
  limit = 8,
  userId?: string,
  excludeIds: string[] = [], // IDs a excluir
): Promise<{ memes: Meme[] }> {
  try {
    // Obtener todos los memes (o los que no están excluidos)
    const allMemes = await db.query.memesTable.findMany({
      where:
        excludeIds.length > 0
          ? not(inArray(memesTable.id, excludeIds))
          : undefined,
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
    });

    // Mezclar aleatoriamente usando Fisher-Yates shuffle
    const shuffled = [...allMemes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tomar solo los primeros 'limit' elementos
    const memeQuery = shuffled.slice(0, limit);

    // Si no hay memes, retornar vacío
    if (memeQuery.length === 0) {
      return { memes: [] };
    }

    // Obtener IDs de memes para verificar likes
    const memeIds = memeQuery.map((m) => m.id);

    let likedMemeIds = new Set<string>();
    if (userId) {
      const likes = await getUserLikeds(userId, memeIds);
      likedMemeIds = new Set(likes);
    }

    const memes: Meme[] = memeQuery.map((meme) => ({
      id: meme.id,
      imageUrl: meme.imageUrl,
      title: meme.title,
      category: meme.category,
      tags: meme.tags.map((mt) => mt.tag),
      likesCount: meme.likesCount,
      commentsCount: meme.commentsCount,
      createdAt: meme.createdAt,
      user: meme.user,
      isLiked: likedMemeIds.has(meme.id),
    }));

    return { memes };
  } catch (error) {
    console.error("[getRandomMemes] Error:", error);
    return { memes: [] };
  }
}
