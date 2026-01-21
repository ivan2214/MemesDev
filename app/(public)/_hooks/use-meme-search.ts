"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchMemesDal } from "@/server/dal/memes";
import { PAGE_SIZE } from "@/shared/constants";
import type { SortType } from "@/shared/types";
import type { Meme } from "@/types/meme";

export function useMemeSearch({
  query,
  sort,
  tags,
  category,
  initialMemes,
}: {
  query: string;
  sort: SortType;
  tags: string[];
  category?: string;
  initialMemes: Meme[];
}) {
  const [memes, setMemes] = useState(initialMemes);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialMemes.length >= PAGE_SIZE);
  const [offset, setOffset] = useState(initialMemes.length);
  const observerTarget = useRef<HTMLDivElement>(null);

  const search = useCallback(
    async (reset = false) => {
      setLoading(true);

      const currentOffset = reset ? 0 : offset;

      const data = await searchMemesDal({
        query,
        sort,
        tags,
        category,
        offset: currentOffset,
        limit: PAGE_SIZE,
      });

      setHasMore(data.memes.length === PAGE_SIZE);
      setOffset(currentOffset + PAGE_SIZE);

      setMemes((prev) => (reset ? data.memes : [...prev, ...data.memes]));

      setLoading(false);
    },
    [query, sort, tags, category, offset],
  );

  // Reset cuando cambia la URL
  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    search(true);
  }, [query, sort, tags.join(","), category]);

  // Infinite scroll
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        search();
      }
    });

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [search, hasMore, loading]);

  return {
    memes,
    loading,
    hasMore,
    observerTarget: observerTarget as React.RefObject<HTMLDivElement>,
  };
}
