import { count } from "drizzle-orm";
import { db } from "@/db";
import { memesTable, user } from "@/db/schemas";
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_LIFE, CACHE_TAGS } from "@/shared/constants";

export const getSystemStatus = async (): Promise<{
  status: boolean;
  users: number;
  memes: number;
}> => {
  "use cache";
  cacheTag(CACHE_TAGS.SYSTEM);
  cacheLife(CACHE_LIFE.DEFAULT);

  const usersCount = await db.select({ count: count() }).from(user);
  const memesCount = await db.select({ count: count() }).from(memesTable);
  const status = usersCount[0].count > 0 && memesCount[0].count > 0;
  return {
    status,
    users: usersCount[0].count,
    memes: memesCount[0].count,
  };
};
