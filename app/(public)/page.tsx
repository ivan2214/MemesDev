import type { Metadata } from "next";
import type { CollectionPage, WithContext } from "schema-dts";
import { getCurrentUser } from "@/data/user";
import { env } from "@/env/server";
import { getAllTags } from "@/server/dal/categories";
import { searchMemesDal } from "@/server/dal/memes";
import type { SortType } from "@/shared/types";
import { SearchPage } from "./_components/search-page";

interface SearchParams {
  q?: string;
  sort?: string;
  tags?: string;
  category?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q;
  const tags = params.tags?.split(",");
  const category = params.category;

  let title = "Memes de programación";
  let description =
    "Encuentra los mejores memes de programación, busca por etiquetas, categorías o palabras clave.";

  if (query) {
    title = `Resultados para "${query}" | MemesDev`;
    description = `Resultados de búsqueda para "${query}" en MemesDev. Encuentra los memes más divertidos sobre ${query}.`;
  } else if (tags) {
    title = `Memes de ${tags} | MemesDev`;
    description = `Explora nuestra colección de memes sobre ${tags}.`;
  } else if (category) {
    title = `Memes de ${category} | MemesDev`;
    description = `Los mejores memes de la categoría ${category}.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${env.APP_URL}`,
      type: "website",
      images: [
        {
          url: "/og-image.webp",
          width: 1200,
          height: 630,
          alt: "MemesDev - Memes de programación para desarrolladores",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${env.APP_URL}`,
    },
  };
}

async function SearchContent({
  query,
  sort,
  tagsSearch,
  category,
}: {
  query?: string;
  sort: SortType;
  tagsSearch?: string[];
  category?: string;
}) {
  const user = await getCurrentUser();
  const [tags, { memes }] = await Promise.all([
    getAllTags(),
    searchMemesDal({
      query,
      offset: 0,
      limit: 12,
      sort,
      tags: tagsSearch,
      category,
      userId: user?.id,
    }),
  ]);

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: query ? `Resultados para "${query}"` : "Memes de programación",
    description: query
      ? `Resultados de búsqueda para "${query}"`
      : "Los mejores memes de programación, busca por etiquetas, categorías o palabras clave.",
    url: `${env.APP_URL}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: memes.map((meme, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${env.APP_URL}/meme/${meme.id}`,
        name: meme.title || "Meme de programación",
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
      <SearchPage initialMemes={memes} tags={tags} />
    </>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q;
  const sort = (params.sort as SortType) || "recent";
  const tagsSearch = params.tags ? params.tags.split(",") : undefined;
  const category = params.category;

  return (
    <SearchContent
      query={query}
      sort={sort}
      tagsSearch={tagsSearch}
      category={category}
    />
  );
}
