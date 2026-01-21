"use server";

import {
  and,
  desc,
  eq,
  exists,
  gte,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";

import { cacheLife, cacheTag } from "next/cache";

// The skill says: import { cacheLife } from 'next/cache'. I'll stick to that.
// If it fails I'll try unstable.
import { db } from "@/db";
import {
  categoriesTable,
  memesTable,
  memeTagsTable,
  tagsTable,
} from "@/db/schemas";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";

// Helper to transform DB result to Partial Meme (without user specific info like isLiked)
// Actually we can return the raw DB shape or a cleaner internal shape.
// The existing `Meme` type has `isLiked`. We can set it to false here and override later.

export async function getRecentMemes({
  offset = 0,
  limit = 12,
}: {
  offset?: number;
  limit?: number;
} = {}) {
  "use cache";
  cacheTag(CACHE_TAGS.MEMES, "recent-memes"); // Tag for list
  cacheLife(CACHE_LIFE.DEFAULT);

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
  });

  return memesData;
}

export async function getMeme(id: string) {
  "use cache";
  cacheTag(CACHE_TAGS.MEMES, CACHE_TAGS.meme(id));
  cacheLife(CACHE_LIFE.DEFAULT);

  const meme = await db.query.memesTable.findFirst({
    where: eq(memesTable.id, id),
    with: {
      user: true,
      likes: true,
      category: true,
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return meme;
}

export type TimeRange = "24h" | "3d" | "7d" | "1m" | "3m" | "1y" | "all";

function getTimeFilter(timeRange: TimeRange): Date | null {
  const now = new Date();
  switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "3d":
      return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "all":
      return null;
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

export async function getHotMemes({
  offset = 0,
  limit = 12,
  sort = "hot",
  timeRange = "24h",
}: {
  offset?: number;
  limit?: number;
  sort?: "recent" | "hot";
  timeRange?: TimeRange;
}) {
  "use cache";
  cacheTag(CACHE_TAGS.MEMES, "hot-memes"); // Granular tags? maybe `hot-memes-${timeRange}`?
  // Arguments are part of cache key automatically.
  cacheLife(CACHE_LIFE.SHORT); // Hot memes change faster?

  const timeFilter = getTimeFilter(timeRange);

  const whereClause = timeFilter
    ? gte(memesTable.createdAt, timeFilter)
    : undefined;

  const orderBy =
    sort === "hot"
      ? [desc(memesTable.likesCount), desc(memesTable.createdAt)]
      : [desc(memesTable.createdAt)];

  return await db.query.memesTable.findMany({
    where: whereClause,
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
  });
}

// Search might be cached with shorter duration or just rely on args
export async function searchMemesDal({
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
  sort?: "recent" | "likes" | "comments";
}) {
  "use cache";
  cacheLife(CACHE_LIFE.SHORT);
  // No broad cache tag for search, maybe just relies on MEMES invalidation?
  // If we add a meme, search results might change.
  cacheTag(CACHE_TAGS.MEMES);

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
      return [];
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

  // Paso 1: Obtener IDs
  const matchedMemes = await db
    .select({ id: memesTable.id })
    .from(memesTable)
    .where(and(...filters))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  if (matchedMemes.length === 0) {
    return [];
  }

  const memeIds = matchedMemes.map((m) => m.id);

  // Paso 2: Traer data completa
  return await db.query.memesTable.findMany({
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
    },
  });
}
