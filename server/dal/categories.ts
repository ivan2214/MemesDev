"use server";

import { desc } from "drizzle-orm";
// import { cacheTag, cacheLife } from "next/cache";
// Note: next/cache imports might need to be verified if they work as expected or need unstable_.
// Based on skill, it is standard import.
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/db";
import { tagsTable } from "@/db/schemas";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";

export async function getAllCategories() {
  "use cache";
  cacheTag(CACHE_TAGS.CATEGORIES);
  cacheLife(CACHE_LIFE.LONG);

  return await db.query.categoriesTable.findMany();
}

export async function getAllTags() {
  "use cache";
  cacheTag(CACHE_TAGS.TAGS);
  cacheLife(CACHE_LIFE.LONG);

  return await db.query.tagsTable.findMany({
    orderBy: [desc(tagsTable.name)],
    limit: 50,
  });
}
