"use server";

import {
  and,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  categoriesTable,
  likesTable,
  memesTable,
  memeTagsTable,
  tagsTable,
} from "@/db/schemas";
import { auth } from "@/lib/auth";
import type { Meme, Tag } from "@/types/meme";

export type SortType = "recent" | "likes" | "comments";

export async function getMemes({
  query = "",
  tags = [],
  category = "",
  offset = 0,
  limit = 12,
  sort = "recent",
}: {
  query?: string;
  tags?: string[];
  category?: string;
  offset?: number;
  limit?: number;
  sort?: SortType;
}): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Construir filtros
    const filters: SQL[] = [];

    // Filtro por Query (Título o Tags)
    if (query.trim()) {
      const searchFilter = or(
        ilike(memesTable.title, `%${query.trim()}%`),
        exists(
          db
            .select({ id: memeTagsTable.id })
            .from(memeTagsTable)
            .innerJoin(tagsTable, eq(memeTagsTable.tagId, tagsTable.id))
            .where(
              and(
                eq(memeTagsTable.memeId, memesTable.id),
                ilike(tagsTable.name, `%${query.trim()}%`),
              ),
            ),
        ),
      );

      if (searchFilter) {
        filters.push(searchFilter);
      }
    }

    // Filtro por Tags específicas
    if (tags.length > 0) {
      for (const tag of tags) {
        filters.push(
          exists(
            db
              .select({ id: memeTagsTable.id })
              .from(memeTagsTable)
              .innerJoin(tagsTable, eq(memeTagsTable.tagId, tagsTable.id))
              .where(
                and(
                  eq(memeTagsTable.memeId, memesTable.id),
                  eq(tagsTable.slug, tag),
                ),
              ),
          ),
        );
      }
    }

    // Filtro por Categoría
    if (category) {
      const categoryData = await db.query.categoriesTable.findFirst({
        where: eq(categoriesTable.slug, category),
        columns: { id: true },
      });

      if (categoryData) {
        filters.push(eq(memesTable.categoryId, categoryData.id));
      } else {
        return { memes: [] };
      }
    }

    // Ordenamiento
    let orderBy: SQL[];
    switch (sort) {
      case "likes":
        orderBy = [desc(memesTable.likesCount), desc(memesTable.createdAt)];
        break;
      case "comments":
        orderBy = [desc(memesTable.commentsCount), desc(memesTable.createdAt)];
        break;
      case "recent":
        orderBy = [desc(memesTable.createdAt)];
        break;
      default:
        orderBy = [desc(memesTable.createdAt)];
        break;
    }

    // Paso 1: Obtener IDs de los memes que coinciden con los filtros
    // Usamos db.select para evitar problemas de alias en subqueries
    const matchedMemes = await db
      .select({ id: memesTable.id })
      .from(memesTable)
      .where(and(...filters))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    if (matchedMemes.length === 0) {
      return { memes: [] };
    }

    const memeIds = matchedMemes.map((m) => m.id);

    // Paso 2: Traer la data completa usando db.query
    const memesData = await db.query.memesTable.findMany({
      where: inArray(memesTable.id, memeIds),
      orderBy: orderBy,
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
  } catch (error) {
    console.error("[searchMemes] Error:", error);
    return { memes: [] };
  }
}

export async function getAllTags(): Promise<{ tags: Tag[] }> {
  const tags = await db.query.tagsTable.findMany({
    orderBy: [desc(tagsTable.name)],
    limit: 50,
  });

  return { tags };
}

// Actualizar también la compatibilidad
export async function searchMemes(
  query: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  return getMemes({ query, offset, limit, sort: "recent" });
}
