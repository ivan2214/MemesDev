import type { Category } from "./category";
import type { Tag } from "./tag";

export interface Meme {
  id: string;
  imageUrl: string;
  title?: string | null;
  category?: Category | null;
  tags?: Tag[] | null;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  isLiked?: boolean;
}
