import type { MetadataRoute } from "next";
import { db } from "@/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com";

  const memes = await db.query.memesTable.findMany({
    columns: {
      id: true,
      createdAt: true,
    },
    limit: 50000,
  });

  const memeUrls = memes.map((meme) => ({
    url: `${baseUrl}/meme/${meme.id}`,
    lastModified: meme.createdAt,
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
    ...memeUrls,
  ];
}
