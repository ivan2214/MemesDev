import type { Metadata } from "next";
import { Suspense } from "react";
import type { CollectionPage, WithContext } from "schema-dts";
import { env } from "@/env/server";
import { getAllTags, getMemes, type SortType } from "./_actions";
import { SearchPage } from "./_components/search-page";
import Loading from "./loading";

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
  const tags = params.tags;
  const category = params.category;

  let title = "Buscar memes de programación";
  let description =
    "Encuentra los mejores memes de programación, busca por etiquetas, categorías o palabras clave.";

  if (query) {
    title = `Resultados para "${query}" | DevMemes`;
    description = `Resultados de búsqueda para "${query}" en DevMemes. Encuentra los memes más divertidos sobre ${query}.`;
  } else if (tags) {
    title = `Memes de ${tags} | DevMemes`;
    description = `Explora nuestra colección de memes sobre ${tags}.`;
  } else if (category) {
    title = `Memes de ${category} | DevMemes`;
    description = `Los mejores memes de la categoría ${category}.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${env.APP_URL}/search`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${env.APP_URL}/search`,
    },
  };
}

async function SearchContent({
  query,
  sort,
  tagsSearch,
  category,
}: {
  query: string;
  sort: SortType;
  tagsSearch?: string[];
  category?: string;
}) {
  const [{ tags }, { memes }] = await Promise.all([
    getAllTags(),
    getMemes({ query, offset: 0, limit: 12, sort, tags: tagsSearch, category }),
  ]);

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: query ? `Resultados para "${query}"` : "Buscar Memes",
    description: query
      ? `Resultados de búsqueda para "${query}"`
      : "Buscador de memes de programación",
    url: `${env.APP_URL}/search`,
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
      <SearchPage
        initialMemes={memes}
        tags={tags}
        initialQuery={query}
        initialSort={sort}
        initialTags={tagsSearch}
      />
    </>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const sort = (params.sort as SortType) || "recent";
  const tagsSearch = params.tags
    ? decodeURIComponent(params.tags).split(",")
    : undefined;
  const category = params.category || "";

  return (
    <Suspense fallback={<Loading />}>
      <SearchContent
        query={query}
        sort={sort}
        tagsSearch={tagsSearch}
        category={category}
      />
    </Suspense>
  );
}
