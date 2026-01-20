import { z } from "zod";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

type TagForForm = Omit<Tag, "createdAt" | "updatedAt">;

type CategoryForm = Omit<
  Category,
  "createdAt" | "updatedAt" | "icon" | "color"
>;

export const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z
    .string()
    .max(500, "La biografía no puede exceder los 500 caracteres")
    .default(""), // Quitar .optional()
  imageKey: z.string().default(""), // Quitar .optional()
  tags: z.array(z.custom<TagForForm>()).nullable(),
  category: z.custom<CategoryForm>().nullable(),
  socials: z
    .array(
      z.object({
        platform: z.string(),
        url: z.url("Debe ser una URL válida"),
      }),
    )
    .default([]), // Quitar .optional()
});

export type ProfileSchema = z.infer<typeof profileSchema>;
