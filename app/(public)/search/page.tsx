import { Suspense } from "react";
import { getAllTags, getMemes, type SortType } from "./_actions";
import { SearchPage } from "./_components/search-page";
import Loading from "./loading";

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

  return (
    <SearchPage
      initialMemes={memes}
      tags={tags}
      initialQuery={query}
      initialSort={sort}
      initialTags={tagsSearch}
    />
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    tags?: string;
    category?: string;
  }>;
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
