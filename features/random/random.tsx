"use client";

import { Shuffle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MemeCard } from "@/shared/components/meme-card";
import type { Meme } from "@/types/meme";

export function RandomPage() {
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(false);

  const loadRandomMeme = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/memes/random");
      if (!response.ok) throw new Error("Failed to fetch random meme");

      const data = await response.json();
      setMeme(data.meme);
    } catch (error) {
      console.error("[v0] Failed to load random meme:", error);
    } finally {
      setLoading(false);
    }
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
        if (meme) {
          setMeme({
            ...meme,
            isLiked: data.liked,
            likesCount: data.likes_count,
          });
        }
      }
    } catch (error) {
      console.error("[v0] Failed to like meme:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shuffle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-balance font-bold text-4xl">Random Meme</h1>
            <p className="text-pretty text-muted-foreground">
              Discover something unexpected
            </p>
          </div>
        </div>
        <Button onClick={loadRandomMeme} disabled={loading} className="gap-2">
          <Shuffle className="h-4 w-4" />
          {loading ? "Loading..." : "New Random"}
        </Button>
      </div>

      {loading && !meme ? (
        <div className="flex min-h-[600px] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : meme ? (
        <div className="mx-auto max-w-2xl">
          <MemeCard meme={meme} onLike={handleLike} isLiked={meme.isLiked} />
        </div>
      ) : (
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-4">
          <Shuffle className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            Click the button above to discover a random meme
          </p>
        </div>
      )}
    </div>
  );
}
