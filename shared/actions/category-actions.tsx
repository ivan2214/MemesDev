"use server";

import { getAllCategories as getAllCategoriesDal } from "@/server/dal/categories";

export const getAllCategories = async () => {
  return await getAllCategoriesDal();
};
