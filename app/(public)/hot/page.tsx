import type { Metadata } from "next";
import type { CollectionPage, WithContext } from "schema-dts";
import { getCurrentUser } from "@/data/user";
import { env } from "@/env/server";
import type { TimeRange } from "@/server/dal/memes";
import { getHotMemes } from "./_actions";
import { HotPage } from "./_components/hot-page";

async function HotMemesVerifier({ timeRange }: { timeRange: TimeRange }) {
  const userId = await getCurrentUser();
  const { memes } = await getHotMemes({
    offset: 0,
    limit: 12,
    sort: "hot",
    timeRange,
    userId: userId?.id,
  });
  return <HotPage initialMemes={memes} initialTimeRange={timeRange} />;
}

export const metadata: Metadata = {
  title: "Memes Populares | MemesDev",
  description:
    "Los memes de programación más populares y virales. Descubre el mejor humor tech del momento.",
  openGraph: {
    title: "Memes Populares | MemesDev",
    description:
      "Los memes de programación más populares y virales. Descubre el mejor humor tech del momento.",
    url: `${env.APP_URL}/hot`,
    type: "website",
  },
  alternates: {
    canonical: `${env.APP_URL}/hot`,
  },
};

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  return <HotPageInner searchParams={searchParams} />;
}

async function HotPageInner({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const params = await searchParams;
  const timeRange = (params.t as TimeRange) || "24h";

  const { memes } = await getHotMemes({
    offset: 0,
    limit: 12,
    sort: "hot",
    timeRange,
    userId: undefined,
  });

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Memes Populares",
    description:
      "Colección de los memes de programación más populares y votados por la comunidad.",
    url: `${env.APP_URL}/hot`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: memes.map((meme, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${env.APP_URL}/meme/${meme.id}`,
        name: meme.title || "Untitled Meme",
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <Used for JSON-LD>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <HotMemesVerifier timeRange={timeRange} />
    </>
  );
}
