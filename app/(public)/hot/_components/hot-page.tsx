"use client";

import { Flame } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TimeRange } from "@/server/dal/memes";
import { MemeCard } from "@/shared/components/meme-card";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { PAGE_SIZE } from "@/shared/constants";
import type { Meme } from "@/types/meme";
import { getHotMemes } from "../_actions";
import { TIME_RANGES } from "../_constants";

export function HotPage({
  initialMemes,
  initialTimeRange = "24h",
}: {
  initialMemes: Meme[];
  initialTimeRange?: TimeRange;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMemes.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMemes.length);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMemes = useCallback(
    async (currentOffset: number, currentTimeRange: TimeRange) => {
      setLoading(true);
      try {
        const data = await getHotMemes({
          offset: currentOffset,
          limit: PAGE_SIZE,
          sort: "hot",
          timeRange: currentTimeRange,
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

  const handleTimeRangeChange = async (newTimeRange: TimeRange) => {
    if (newTimeRange === timeRange) return;

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("t", newTimeRange);
    router.push(`/hot?${params.toString()}`, { scroll: false });

    setTimeRange(newTimeRange);
    setMemes([]);
    setOffset(0);
    setHasMore(true);
    setLoading(true);

    try {
      const data = await getHotMemes({
        offset: 0,
        limit: PAGE_SIZE,
        sort: "hot",
        timeRange: newTimeRange,
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
          loadMemes(newOffset, timeRange);
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
  }, [hasMore, loading, offset, timeRange, loadMemes]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-balance font-bold text-2xl">Hot Memes</h1>
            <p className="text-pretty text-muted-foreground text-sm">
              Los memes más populares
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              onClick={() => handleTimeRangeChange(range.value)}
              size="sm"
              variant={timeRange === range.value ? "default" : "outline"}
              className={
                timeRange === range.value
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && memes.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
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

          {!loading && memes.length === 0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <Flame className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No hay memes en este período
              </p>
              <p className="text-muted-foreground text-sm">
                Prueba seleccionando otro rango de tiempo
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
