"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { getMemes, type SortType } from "../_actions";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "likes", label: "Más likes" },
  { value: "comments", label: "Más comentarios" },
];

export function SearchPage({
  initialMemes,
  initialTags,
  initialQuery = "",
  initialSort = "recent",
}: {
  initialMemes: Meme[];
  initialTags: string[];
  initialQuery?: string;
  initialSort?: SortType;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMemes.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMemes.length);
  const [selectedTag, setSelectedTag] = useState<string | null>(
    initialQuery || null,
  );
  const [tags] = useState<string[]>(initialTags);
  const [sort, setSort] = useState<SortType>(initialSort);
  const observerTarget = useRef<HTMLDivElement>(null);

  const updateUrl = useCallback(
    (newQuery: string, newSort: SortType) => {
      const params = new URLSearchParams();
      if (newQuery) params.set("q", newQuery);
      if (newSort !== "recent") params.set("sort", newSort);
      const queryString = params.toString();
      router.push(`/search${queryString ? `?${queryString}` : ""}`, {
        scroll: false,
      });
    },
    [router],
  );

  const doSearch = useCallback(
    async (
      q: string,
      currentOffset: number,
      currentSort: SortType,
      reset = false,
    ) => {
      setLoading(true);
      try {
        const data = await getMemes({
          query: q,
          offset: currentOffset,
          limit: PAGE_SIZE,
          sort: currentSort,
        });

        if (data.memes.length < PAGE_SIZE) {
          setHasMore(false);
        }

        if (reset) {
          setMemes(data.memes);
        } else {
          setMemes((prev) => [...prev, ...data.memes]);
        }
      } catch (error) {
        console.error("Failed to search memes:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const newOffset = offset + PAGE_SIZE;
          setOffset(newOffset);
          doSearch(searchQuery, newOffset, sort);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, offset, searchQuery, sort, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
    setSelectedTag(null);
    setOffset(0);
    setHasMore(true);
    updateUrl(query, sort);
    doSearch(query, 0, sort, true);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setSearchQuery(tag);
    setSelectedTag(tag);
    setOffset(0);
    setHasMore(true);
    updateUrl(tag, sort);
    doSearch(tag, 0, sort, true);
  };

  const handleSortChange = (newSort: SortType) => {
    if (newSort === sort) return;
    setSort(newSort);
    setOffset(0);
    setHasMore(true);
    updateUrl(searchQuery, newSort);
    doSearch(searchQuery, 0, newSort, true);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchQuery("");
    setSelectedTag(null);
    setOffset(0);
    setHasMore(true);
    updateUrl("", sort);
    doSearch("", 0, sort, true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-balance font-bold text-3xl">Buscar Memes</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10 pl-10"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              size="sm"
              variant={sort === option.value ? "default" : "outline"}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags Chips */}
      {tags.length > 0 && (
        <div>
          <h2 className="mb-3 font-medium text-muted-foreground text-sm">
            Tags populares
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 15).map((tag) => (
              <Button
                key={tag}
                onClick={() => handleTagClick(tag)}
                size="sm"
                variant={selectedTag === tag ? "default" : "secondary"}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {loading && memes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          {searchQuery && (
            <p className="text-muted-foreground text-sm">
              {memes.length} resultado{memes.length !== 1 ? "s" : ""} para "
              {searchQuery}"
            </p>
          )}

          {memes.length > 0 ? (
            <>
              <div className="flex flex-col gap-6">
                {memes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
                ))}
              </div>

              {hasMore && (
                <div ref={observerTarget} className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              )}

              {!hasMore && memes.length > 0 && (
                <p className="text-center text-muted-foreground">
                  ¡Has llegado al final!
                </p>
              )}
            </>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No se encontraron memes
              </p>
              <p className="text-muted-foreground text-sm">
                Prueba con otro término de búsqueda o selecciona un tag
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
