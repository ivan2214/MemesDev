"use server";

import { and, desc, eq, exists, ilike, or, type SQL, sql } from "drizzle-orm";
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
import type { Meme } from "@/types/meme";

export type SortType = "recent" | "likes" | "comments";

export async function getMemes({
  query = "",
  tag = "",
  category = "",
  offset = 0,
  limit = 12,
  sort = "recent",
}: {
  query?: string;
  tag?: string;
  category?: string;
  offset?: number;
  limit?: number;
  sort?: SortType;
}): Promise<{ memes: Meme[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    // Construir filtros
    const filters = [];

    if (query.trim()) {
      filters.push(
        or(
          ilike(memesTable.title, `%${query.trim()}%`),
          exists(
            db
              .select()
              .from(memeTagsTable)
              .innerJoin(tagsTable, eq(memeTagsTable.tagId, tagsTable.id))
              .where(
                and(
                  eq(memeTagsTable.memeId, memesTable.id),
                  ilike(tagsTable.name, `%${query.trim()}%`),
                ),
              ),
          ),
        ),
      );
    }

    if (tag) {
      filters.push(
        exists(
          db
            .select()
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

    if (category) {
      filters.push(
        exists(
          db
            .select()
            .from(categoriesTable)
            .where(
              and(
                eq(categoriesTable.id, memesTable.categoryId),
                eq(categoriesTable.slug, category),
              ),
            ),
        ),
      );
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

    const memesData = await db.query.memesTable.findMany({
      where: and(...filters),
      orderBy: orderBy,
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
              "isLiked",
            )
          : sql<boolean>`false`.as("isLiked"),
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
      isLiked: meme.isLiked,
    }));

    return { memes };
  } catch (error) {
    console.error("[searchMemes] Error:", error);
    return { memes: [] };
  }
}

export async function getAllTags(): Promise<{ tags: string[] }> {
  const result = await db.query.tagsTable.findMany({
    orderBy: [desc(tagsTable.name)],
    limit: 50,
  });

  return { tags: result.map((t) => t.name) };
}

// Actualizar también la compatibilidad
export async function searchMemes(
  query: string,
  offset = 0,
  limit = 12,
): Promise<{ memes: Meme[] }> {
  return getMemes({ query, offset, limit, sort: "recent" });
}
