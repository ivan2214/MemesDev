"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { toggleLike } from "@/shared/actions/meme-actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardFooter } from "@/shared/components/ui/card";
import type { Meme } from "@/types/meme";

interface MemeCardProps {
  meme: Meme;

  isLiked?: boolean;
}

export function MemeCard({ meme, isLiked }: MemeCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: `${window.location.origin}/meme/${meme.id}`,
          title: "Mira este meme ",
        });
      } catch (err) {
        console.error("Error sharing meme:", err);
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${window.location.origin}/meme/${meme.id}`,
      );
    }
  };

  const handleLike = async (memeId: string) => {
    try {
      await toggleLike(memeId);
    } catch (error) {
      console.error("[HotPage] Failed to like meme:", error);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/meme/${meme.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/** biome-ignore lint/performance/noImgElement: <temp> */}
          <img
            src={meme.imageUrl || "/placeholder.svg"}
            alt={meme.id}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <CardFooter className="flex items-center justify-between border-border/50 border-t p-4">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className={`gap-1.5 ${isLiked ? "text-red-500" : ""}`}
            onClick={() => handleLike?.(meme.id)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{meme.likesCount}</span>
          </Button>
          <Link href={`/meme/${meme.id}#comments`}>
            <Button size="sm" variant="ghost" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span>{meme.commentsCount}</span>
            </Button>
          </Link>
        </div>
        <Button size="sm" variant="ghost" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
