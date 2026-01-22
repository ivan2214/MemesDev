import type { notificationTable } from "@/db/schemas";
import type { User } from "@/lib/auth";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

export type Notification = typeof notificationTable.$inferSelect;

export type TimeFilter =
  | "24h"
  | "3days"
  | "1week"
  | "1month"
  | "6months"
  | "1year"
  | "all";

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage: string;
  members: number;
  memes: number;
  tags: string[];
  moderators: User[];
  isJoined?: boolean;
}

export type SortType = "recent" | "likes" | "comments";

export type TagForForm = Omit<Tag, "createdAt" | "updatedAt">;
export type CategoryForm = Omit<
  Category,
  "createdAt" | "updatedAt" | "icon" | "color"
>;

export interface Creator extends User {
  totalMemes: number;
  totalLikes: number;
  totalComments: number;
}
