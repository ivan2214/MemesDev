"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toggleLike } from "@/shared/actions/meme-actions";
import { MemeCard } from "@/shared/components/meme-card";
import { getMemes } from "./actions";

interface Meme {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  tags: string[] | null;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  userId: string;
  userName: string;
  isLiked: boolean;
}

export function HomePage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMemes = useCallback(async (currentOffset: number) => {
    try {
      const data = await getMemes(currentOffset, 12);

      if (data.memes.length < 12) {
        setHasMore(false);
      }

      setMemes((prev) => [...prev, ...data.memes]);
    } catch (error) {
      console.error("Failed to load memes:", error);
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
      const result = await toggleLike(memeId);
      setMemes((prev) =>
        prev.map((meme) =>
          meme.id === memeId
            ? {
                ...meme,
                isLiked: result.liked,
                likesCount: result.liked
                  ? meme.likesCount + 1
                  : meme.likesCount - 1,
              }
            : meme,
        ),
      );
    } catch (error) {
      console.error("Failed to like meme:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-balance font-bold text-4xl">Latest Memes</h1>
        <p className="text-pretty text-muted-foreground">
          Fresh programming humor from the community
        </p>
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
              <p className="text-lg text-muted-foreground">No memes yet</p>
              <p className="text-muted-foreground text-sm">
                Be the first to upload one!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
