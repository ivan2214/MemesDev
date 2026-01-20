"use client";

import { Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { getHotMemes } from "../_actions";

const PAGE_SIZE = 12;

type SortType = "hot" | "recent";

export function HotPage({ initialMemes }: { initialMemes: Meme[] }) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMemes.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMemes.length);
  const [sort, setSort] = useState<SortType>("hot");
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMemes = useCallback(
    async (currentOffset: number, currentSort: SortType) => {
      setLoading(true);
      try {
        const data = await getHotMemes({
          offset: currentOffset,
          limit: PAGE_SIZE,
          sort: currentSort,
        });

        if (data.memes.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setMemes((prev) => [...prev, ...data.memes]);
      } catch (error) {
        console.error("Failed to load memes:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Reset when sort changes
  const handleSortChange = async (newSort: SortType) => {
    if (newSort === sort) return;
    setSort(newSort);
    setMemes([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);

    try {
      const data = await getHotMemes({
        offset: 0,
        limit: PAGE_SIZE,
        sort: newSort,
      });

      if (data.memes.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setMemes(data.memes);
      setOffset(data.memes.length);
    } catch (error) {
      console.error("Failed to load memes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const newOffset = offset + PAGE_SIZE;
          setOffset(newOffset);
          loadMemes(newOffset, sort);
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
  }, [hasMore, loading, offset, sort, loadMemes]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-balance font-bold text-4xl">Hot Memes</h1>
            <p className="text-pretty text-muted-foreground">
              Trending programming humor right now
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleSortChange("hot")}
            className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
              sort === "hot"
                ? "bg-orange-500 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Hot
          </Button>
          <Button
            onClick={() => handleSortChange("recent")}
            className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
              sort === "recent"
                ? "bg-orange-500 text-white"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Recent
          </Button>
        </div>
      </div>

      {loading && memes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memes.map((meme) => (
              <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="mt-8 flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {!hasMore && memes.length > 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              ¡Has llegado al final!
            </p>
          )}

          {!loading && memes.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <Flame className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No hot memes found
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
