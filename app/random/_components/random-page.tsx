"use client";

import { Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { getRandomMemes } from "../_actions";

const PAGE_SIZE = 8;

export function RandomPage({ initialMemes }: { initialMemes: Meme[] }) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreMemes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRandomMemes(PAGE_SIZE);
      if (data.memes.length === 0) {
        setHasMore(false);
      } else {
        setMemes((prev) => [...prev, ...data.memes]);
      }
    } catch (error) {
      console.error("Failed to load random memes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const shuffleAll = async () => {
    setLoading(true);
    setMemes([]);
    try {
      const data = await getRandomMemes(PAGE_SIZE);
      setMemes(data.memes);
      setHasMore(data.memes.length > 0);
    } catch (error) {
      console.error("Failed to shuffle memes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreMemes();
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
  }, [hasMore, loading, loadMoreMemes]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shuffle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-balance font-bold text-4xl">Random Memes</h1>
            <p className="text-pretty text-muted-foreground">
              Discover something unexpected
            </p>
          </div>
        </div>
        <Button onClick={shuffleAll} disabled={loading} className="gap-2">
          <Shuffle className="h-4 w-4" />
          {loading ? "Loading..." : "Shuffle All"}
        </Button>
      </div>

      {loading && memes.length === 0 ? (
        <div className="flex min-h-[600px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : memes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memes.map((meme, index) => (
              <MemeCard
                key={`${meme.id}-${index}`}
                meme={meme}
                isLiked={meme.isLiked}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="mt-8 flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
          <Shuffle className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">No memes found</p>
          <p className="text-muted-foreground text-sm">
            Try uploading some memes first!
          </p>
        </div>
      )}
    </div>
  );
}
