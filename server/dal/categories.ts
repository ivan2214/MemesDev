import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { memeTagsTable, tagsTable } from "@/db/schemas";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";

export async function getAllCategories() {
  "use cache";
  cacheTag(CACHE_TAGS.CATEGORIES);
  cacheLife(CACHE_LIFE.LONG);

  return await db.query.categoriesTable.findMany();
}

export async function getPopularTags() {
  "use cache";
  cacheTag(CACHE_TAGS.TAGS_POPULAR);
  cacheLife(CACHE_LIFE.LONG);

  // Obtener los tags ordenados por cantidad de memes con toda la info
  const popularTagsQuery = await db
    .select({
      id: tagsTable.id,
      name: tagsTable.name,
      slug: tagsTable.slug,
      createdAt: tagsTable.createdAt,
      memeCount: count(memeTagsTable.memeId),
    })
    .from(tagsTable)
    .innerJoin(memeTagsTable, eq(memeTagsTable.tagId, tagsTable.id))
    .groupBy(tagsTable.id, tagsTable.name, tagsTable.slug, tagsTable.createdAt)
    .orderBy(desc(count(memeTagsTable.memeId)))
    .limit(10);

  return popularTagsQuery;
}
