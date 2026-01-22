"use client";

import { Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { PAGE_SIZE } from "@/shared/constants";
import type { Meme } from "@/types/meme";
import { getRandomMemes } from "../_actions";

export function RandomPage({
  initialMemes,
  userId,
}: {
  initialMemes: Meme[];
  userId?: string;
}) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Mantener un Set con todos los IDs de memes ya mostrados
  const loadedMemeIds = useRef<Set<string>>(
    new Set(initialMemes.map((m) => m.id)),
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMoreMemes = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Pasar los IDs ya cargados para excluirlos
      const excludeIds = Array.from(loadedMemeIds.current);
      const data = await getRandomMemes(PAGE_SIZE, userId, excludeIds);

      if (data.memes.length === 0) {
        setHasMore(false);
      } else {
        // Agregar los nuevos IDs al Set

        for (const meme of data.memes) {
          loadedMemeIds.current.add(meme.id);
        }
        setMemes((prev) => [...prev, ...data.memes]);
      }
    } catch (error) {
      console.error("Failed to load random memes:", error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const shuffleAll = async () => {
    setLoading(true);
    setMemes([]);

    // Resetear el Set de IDs cargados
    loadedMemeIds.current.clear();

    try {
      const data = await getRandomMemes(PAGE_SIZE);

      // Agregar los nuevos IDs al Set

      for (const meme of data.memes) {
        loadedMemeIds.current.add(meme.id);
      }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shuffle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-balance font-bold text-2xl">Random Memes</h1>
            <p className="text-pretty text-muted-foreground text-sm">
              Descubre algo inesperado
            </p>
          </div>
        </div>
        <Button onClick={shuffleAll} disabled={loading} className="gap-2">
          <Shuffle className="h-4 w-4" />
          {loading ? "Cargando..." : "Mezclar"}
        </Button>
      </div>

      {loading && memes.length === 0 ? (
        <div className="flex min-h-[600px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : memes.length > 0 ? (
        <>
          <div className="flex flex-col gap-6">
            {memes.map((meme, index) => (
              <MemeCard
                key={`${meme.id}-${index}`}
                meme={meme}
                isLiked={meme.isLiked}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </>
      ) : (
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
          <Shuffle className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">No hay memes</p>
          <p className="text-muted-foreground text-sm">
            ¡Prueba subiendo algunos memes primero!
          </p>
        </div>
      )}
    </div>
  );
}
