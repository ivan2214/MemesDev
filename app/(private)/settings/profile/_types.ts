import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

export type UserSettings =
  | {
      name?: string;
      bio: string | null;
      imageKey: string | null;
      id: string;
      socials:
        | {
            platform: string;
            url: string;
          }[]
        | null;
      email: string;
      emailVerified: boolean;
      image: string | null;
      createdAt: Date;
      categoryId: string | null;
      updatedAt: Date;
      category?: Category | null;
      tags: Tag[] | null;
    }
  | undefined;
