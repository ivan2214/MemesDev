"use server";

import { cache } from "react";
import { db } from "@/db";

export const getAllCategories = cache(async () => {
  const categories = await db.query.categoriesTable.findMany();
  return categories;
});
