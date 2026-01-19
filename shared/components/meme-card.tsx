"use client";

import { Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface MemeCardProps {
  meme: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    tags?: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    user: {
      id: string;
      name: string;
    };
  };
  onLike?: (memeId: string) => void;
  isLiked?: boolean;
}

export function MemeCard({ meme, onLike, isLiked }: MemeCardProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title,
          text: meme.description || meme.title,
          url: `${window.location.origin}/meme/${meme.id}`,
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

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/meme/${meme.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/** biome-ignore lint/performance/noImgElement: <temp> */}
          <img
            src={meme.image_url || "/placeholder.svg"}
            alt={meme.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/meme/${meme.id}`}>
          <h3 className="mb-2 line-clamp-2 text-balance font-semibold leading-tight transition-colors hover:text-primary">
            {meme.title}
          </h3>
        </Link>
        {meme.description && (
          <p className="mb-3 line-clamp-2 text-pretty text-muted-foreground text-sm">
            {meme.description}
          </p>
        )}
        {meme.tags && meme.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {meme.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary/80"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <Link
          href={`/profile/${meme.user.id}`}
          className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {meme.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{meme.user.name}</span>
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-border/50 border-t p-4">
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className={`gap-1.5 ${isLiked ? "text-red-500" : ""}`}
            onClick={() => onLike?.(meme.id)}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span>{meme.likes_count}</span>
          </Button>
          <Link href={`/meme/${meme.id}#comments`}>
            <Button size="sm" variant="ghost" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span>{meme.comments_count}</span>
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
