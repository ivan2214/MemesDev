"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toggleLike } from "@/shared/actions/meme-actions";
import { MemeCard } from "@/shared/components/meme-card";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";
import { getMemes } from "../../app/(home)/actions";

const PAGE_SIZE = 12;

export function HomePage({ initialMemes }: { initialMemes: Meme[] }) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMemes.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMemes.length);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMemes = useCallback(async (currentOffset: number) => {
    setLoading(true);
    try {
      const data = await getMemes(currentOffset, PAGE_SIZE);

      if (data.memes.length < PAGE_SIZE) {
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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const newOffset = offset + PAGE_SIZE;
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
          <p className="text-lg text-muted-foreground">
            No se encontraron memes
          </p>
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
              ¡Has llegado al final!
            </p>
          )}

          {!loading && memes.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                ¡No hay memes todavía!
              </p>
              <p className="text-muted-foreground text-sm">
                ¡Sea el primero en subir uno!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
