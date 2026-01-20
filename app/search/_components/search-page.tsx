"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { searchMemes } from "../_actions";

const PAGE_SIZE = 12;

export function SearchPage({ initialTags }: { initialTags: string[] }) {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");

  const [query, setQuery] = useState(tagParam || "");
  const [searchQuery, setSearchQuery] = useState(tagParam || "");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(tagParam);
  const [tags] = useState<string[]>(initialTags);
  const observerTarget = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(
    async (q: string, currentOffset: number, reset = false) => {
      if (!q.trim()) {
        setMemes([]);
        setHasMore(false);
        return;
      }

      setLoading(true);
      try {
        const data = await searchMemes(q, currentOffset, PAGE_SIZE);

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

  // Initial search when tag param is present
  useEffect(() => {
    if (tagParam) {
      setQuery(tagParam);
      setSearchQuery(tagParam);
      setSelectedTag(tagParam);
      setOffset(0);
      setHasMore(true);
      doSearch(tagParam, 0, true);
    }
  }, [tagParam, doSearch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && searchQuery) {
          const newOffset = offset + PAGE_SIZE;
          setOffset(newOffset);
          doSearch(searchQuery, newOffset);
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
  }, [hasMore, loading, offset, searchQuery, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchQuery(query);
      setSelectedTag(null);
      setOffset(0);
      setHasMore(true);
      doSearch(query, 0, true);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setSearchQuery(tag);
    setSelectedTag(tag);
    setOffset(0);
    setHasMore(true);
    doSearch(tag, 0, true);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchQuery("");
    setSelectedTag(null);
    setMemes([]);
    setOffset(0);
    setHasMore(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-balance font-bold text-4xl">Search Memes</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by tags..."
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
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Tags Chips */}
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-medium text-muted-foreground text-sm">
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <Button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
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
      ) : searchQuery ? (
        <>
          <p className="mb-6 text-muted-foreground text-sm">
            {memes.length} result{memes.length !== 1 ? "s" : ""} for "
            {searchQuery}"
          </p>

          {memes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {memes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
                ))}
              </div>

              {hasMore && (
                <div
                  ref={observerTarget}
                  className="mt-8 flex justify-center py-8"
                >
                  <Spinner className="h-8 w-8" />
                </div>
              )}

              {!hasMore && memes.length > 0 && (
                <p className="mt-8 text-center text-muted-foreground">
                  ¡Has llegado al final!
                </p>
              )}
            </>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <p className="text-lg text-muted-foreground">No memes found</p>
              <p className="text-muted-foreground text-sm">
                Try a different search term or select a tag
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            Enter a search term or select a tag to find memes
          </p>
        </div>
      )}
    </div>
  );
}
