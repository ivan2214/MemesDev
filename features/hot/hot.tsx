"use client";

import { Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MemeCard } from "@/shared/components/meme-card";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { getHotMemes, toggleLikeMeme } from "../../app/hot/actions";

export function HotPage({ initialMemes }: { initialMemes: Meme[] }) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialMemes.length);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMemes = useCallback(async (currentOffset: number) => {
    try {
      const data = await getHotMemes({
        offset: currentOffset,
        limit: 12,
        sort: "hot",
      });

      if (data.memes.length < 12) {
        setHasMore(false);
      }

      setMemes((prev) => [...prev, ...data.memes]);
    } catch (error) {
      console.error("[HotPage] Failed to load hot memes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemes(0);
  }, [loadMemes]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const newOffset = offset + 12;
          setOffset(newOffset);
          loadMemes(newOffset);
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
  }, [hasMore, loading, offset, loadMemes]);

  const handleLike = async (memeId: string) => {
    try {
      // Optimistic update could be added here
      const data = await toggleLikeMeme(memeId);

      setMemes((prev) =>
        prev.map((meme) =>
          meme.id === memeId
            ? { ...meme, is_liked: data.liked, likes_count: data.likes_count }
            : meme,
        ),
      );
    } catch (error) {
      console.error("[HotPage] Failed to like meme:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-balance font-bold text-4xl">Hot Memes</h1>
          <p className="text-pretty text-muted-foreground">
            Trending programming humor right now
          </p>
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
              <MemeCard
                key={meme.id}
                meme={meme}
                onLike={handleLike}
                isLiked={meme.isLiked}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="mt-8 flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}

          {!hasMore && memes.length > 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              You've reached the end!
            </p>
          )}

          {!loading && memes.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <p className="text-lg text-muted-foreground">No hot memes yet</p>
              <p className="text-muted-foreground text-sm">Check back later!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
