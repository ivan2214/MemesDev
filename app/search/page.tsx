import { Suspense } from "react";
import { getAllTags, getMemes, type SortType } from "./_actions";
import { SearchPage } from "./_components/search-page";
import Loading from "./loading";

async function SearchContent({
  query,
  sort,
}: {
  query: string;
  sort: SortType;
}) {
  const [{ tags }, { memes }] = await Promise.all([
    getAllTags(),
    getMemes({ query, offset: 0, limit: 12, sort }),
  ]);

  return (
    <SearchPage
      initialMemes={memes}
      initialTags={tags}
      initialQuery={query}
      initialSort={sort}
    />
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const sort = (params.sort as SortType) || "recent";

  return (
    <Suspense fallback={<Loading />}>
      <SearchContent query={query} sort={sort} />
    </Suspense>
  );
}
