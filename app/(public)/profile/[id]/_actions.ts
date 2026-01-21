"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import {
  getUserMemesDal,
  getUserProfile as getUserProfileDal,
} from "@/server/dal/users";
import type { Meme } from "@/types/meme";
import type { UserProfile } from "@/types/profile";

export async function getUserProfile(userId: string): Promise<{
  user?: UserProfile | null;
}> {
  const user = await getUserProfileDal(userId);
  return { user };
}

export async function getUserMemes(
  userId: string,
  offset = 0,
  limit = 12,
  skipAuth = false,
): Promise<{ memes: Meme[] }> {
  const session = skipAuth
    ? null
    : await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const memesData = await getUserMemesDal({ userId, offset, limit });

  if (memesData.length === 0) {
    return { memes: [] };
  }

  let likedMemeIds = new Set<string>();
  if (currentUserId) {
    const likes = await getUserLikeds(
      currentUserId,
      memesData.map((m) => m.id),
    );
    likedMemeIds = new Set(likes);
  }

  const memes: Meme[] = memesData.map((meme) => ({
    id: meme.id,
    imageUrl: meme.imageUrl,
    title: meme.title,
    category: meme.category,
    tags: meme.tags.map((mt) => mt.tag),
    likesCount: meme.likesCount,
    commentsCount: meme.commentsCount,
    createdAt: meme.createdAt,
    user: meme.user,
    isLiked: likedMemeIds.has(meme.id),
  }));

  return { memes };
}
