"use client";

import { Search as SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { MemeCard } from "@/shared/components/meme-card";
import type { Meme } from "@/types/meme";

export function SearchPage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get("tag");

  const [query, setQuery] = useState(tagParam || "");
  const [searchQuery, setSearchQuery] = useState(tagParam || "");
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tagParam) {
      setQuery(tagParam);
      setSearchQuery(tagParam);
    }
  }, [tagParam]);

  useEffect(() => {
    if (searchQuery) {
      searchMemes(searchQuery);
    }
  }, [searchQuery]);

  const searchMemes = async (q: string) => {
    if (!q.trim()) {
      setMemes([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/memes/search?q=${encodeURIComponent(q)}`,
      );
      if (!response.ok) throw new Error("Failed to search memes");

      const data = await response.json();
      setMemes(data.memes);
    } catch (error) {
      console.error("[v0] Failed to search memes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  const handleLike = async (memeId: string) => {
    try {
      const response = await fetch("/api/memes/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeId }),
      });

      if (response.ok) {
        const data = await response.json();
        setMemes((prev) =>
          prev.map((meme) =>
            meme.id === memeId
              ? { ...meme, is_liked: data.liked, likes_count: data.likes_count }
              : meme,
          ),
        );
      }
    } catch (error) {
      console.error("[v0] Failed to like meme:", error);
    }
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
              placeholder="Search by title, description, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {loading ? (
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {memes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onLike={handleLike}
                  isLiked={meme.isLiked}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <p className="text-lg text-muted-foreground">No memes found</p>
              <p className="text-muted-foreground text-sm">
                Try a different search term
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            Enter a search term to find memes
          </p>
        </div>
      )}
    </div>
  );
}
