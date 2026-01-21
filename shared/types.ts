import type { User as UserBa } from "@/lib/auth";

export interface User extends UserBa {
  username: string;
  bio: string;
  rank?: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "ARCHITECT";
  memesPublished: number;
  upvotes: number;
  followers: number;
  following: number;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
}

export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  author: User;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  memeId: string;
  author: User;
  content: string;
  likes: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Tag {
  name: string;
  count: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type TimeFilter =
  | "24h"
  | "3days"
  | "1week"
  | "1month"
  | "6months"
  | "1year"
  | "all";

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "system";
  from: string;
  avatar?: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

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
