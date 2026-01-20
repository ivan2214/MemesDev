import type { MetadataRoute } from "next";
import { env } from "@/env/server";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile/", "/upload", "/admin"],
    },
    sitemap: `${env.APP_URL}/sitemap.xml`,
  };
}
