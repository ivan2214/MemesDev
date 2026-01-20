"use server";

import { ilike } from "drizzle-orm";
import { db } from "@/db";
import { categoriesTable } from "@/db/schemas";
import type { Category } from "@/types/category";

export async function searchCategories(query?: string): Promise<Category[]> {
  // If there's a search query, filter the categories
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    return db.query.categoriesTable.findMany({
      where: ilike(categoriesTable.name, `%${lowercaseQuery}%`),
    });
  }

  // Return first 10 users if no query
  return db.query.categoriesTable.findMany({
    limit: 10,
  });
}
