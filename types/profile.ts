import type { Category, Tag } from "./meme";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  memesCount: number;
  totalLikes: number;
  image?: string | null;
  bio?: string | null;
  socials?: { platform: string; url: string }[] | null;
  tags?: Tag[] | null;
  category?: Category | null;
}
