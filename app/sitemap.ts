import type { MetadataRoute } from "next";
import { db } from "@/db";
import { env } from "@/env/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.APP_URL;

  const [memes, profiles] = await Promise.all([
    db.query.memesTable.findMany({
      columns: {
        id: true,
        createdAt: true,
      },
      limit: 50000,
    }),
    db.query.user.findMany({
      columns: {
        id: true,
        createdAt: true,
      },
      limit: 50000,
    }),
  ]);

  const memeUrls = memes.map((meme) => ({
    url: `${baseUrl}/meme/${meme.id}`,
    lastModified: meme.createdAt,
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  const profilesUrls = profiles.map((profile) => ({
    url: `${baseUrl}/profile/${profile.id}`,
    lastModified: profile.createdAt,
    changeFrequency: "weekly" as const,
    priority: 1,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/hot`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/random`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...memeUrls,
    ...profilesUrls,
  ];
}
