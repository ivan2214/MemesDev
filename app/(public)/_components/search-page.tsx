"use client";

import { useQueryParams } from "@/shared/hooks/use-query-params";
import type { SortType } from "@/shared/types";
import type { Meme } from "@/types/meme";
import type { Tag } from "@/types/tag";
import { useMemeSearch } from "../_hooks/use-meme-search";
import { MemeResults } from "./meme-results";
import { SearchBar } from "./search-bar";
import { SortOptions } from "./search-options";
import { TagsFilter } from "./tags-filter";

export function SearchPage({
  initialMemes,
  tags,
  userId,
}: {
  initialMemes: Meme[];
  tags: Tag[];
  userId?: string;
}) {
  const { toggleInArray, clear, get, getArray, set } = useQueryParams();

  const query = get("q") ?? "";
  const sort = (get("sort") as SortType) ?? "recent";
  const selectedTags = getArray("tags");
  const category = get("category") ?? undefined;

  const search = useMemeSearch({
    query,
    sort,
    tags: selectedTags,
    category,
    initialMemes,
    userId,
  });

  return (
    <div className="space-y-6">
      <SearchBar
        value={query}
        onChange={(v) => set("q", v)}
        onSubmit={() => {}}
        onClear={() => clear()}
      />

      <SortOptions value={sort} onChange={(v) => set("sort", v)} />

      <TagsFilter
        tags={tags}
        selected={selectedTags}
        onSelect={(tag) => toggleInArray("tags", tag)}
      />

      <MemeResults
        memes={search.memes}
        loading={search.loading}
        hasMore={search.hasMore}
        observerRef={search.observerTarget}
        activeTags={selectedTags}
      />
    </div>
  );
}
