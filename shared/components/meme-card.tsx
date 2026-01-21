"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Check,
  Heart,
  MessageCircle,
  Share2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/shared/actions/meme-actions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  getCategoryStyles,
  getIconByName,
  getTagIcon,
} from "@/shared/lib/tag-icons";
import type { Meme } from "@/types/meme";
import { AuthDialog, useAuth } from "./auth-dialog";

interface MemeCardProps {
  meme: Meme;
  isLiked?: boolean;
  activeTags?: string[];
}

export function MemeCard({ meme, isLiked, activeTags }: MemeCardProps) {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id : null;
  const [copied, setCopied] = useState(false);

  // Optimistic UI state
  const [likedState, setLikedState] = useState({
    isLiked: isLiked ?? meme.isLiked ?? false,
    likesCount: meme.likesCount,
  });

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/meme/${meme.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
          title: meme.title || "Mira este meme 😂",
        });
      } catch (err) {
        console.error("Error al compartir:", err);

        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [meme.id, meme.title]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      return toast.error("Debes iniciar sesión para dar like", {
        duration: 2000,
      });
    }
    if (currentUserId === meme.user.id) {
      return toast.error("No puedes dar like a tus propios memes", {
        duration: 2000,
      });
    }

    // Optimistic update
    const previousState = likedState;
    const newIsLiked = !previousState.isLiked;

    setLikedState({
      isLiked: newIsLiked,
      likesCount: newIsLiked
        ? previousState.likesCount + 1
        : Math.max(0, previousState.likesCount - 1),
    });

    try {
      const { liked } = await toggleLike(meme.id);

      // Verify server state matches our optimistic state
      if (liked !== newIsLiked) {
        // If discrepancy, correct it
        setLikedState((prev) => ({
          isLiked: liked,
          likesCount: liked
            ? prev.likesCount + 1
            : Math.max(0, prev.likesCount - 1),
        }));
      }
    } catch (error) {
      console.error("[MemeCard] Failed to like meme:", error);
      // Revert on error
      setLikedState(previousState);
      toast.error("Error al procesar el like");
    }
  }, [meme.id, meme.user.id, isAuthenticated, currentUserId, likedState]);

  const formattedDate = formatDistanceToNow(new Date(meme.createdAt), {
    addSuffix: true,
    locale: es,
  });

  // Obtener icono de categoría si existe
  const CategoryIcon = meme.category?.icon
    ? getIconByName(meme.category.icon)
    : null;

  return (
    <Card className="group gap-0 overflow-hidden border-border/40 bg-card/50 p-0 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-primary/5 hover:shadow-xl">
      {/* Header - User info, Category & Date */}
      <CardHeader className="flex flex-col gap-4 border-border/30 border-b px-4 py-3">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${meme.user.id}`} className="group/avatar">
              <Avatar className="h-10 w-10 ring-2 ring-transparent transition-all group-hover/avatar:ring-primary/50">
                <AvatarImage
                  src={meme.user.image || undefined}
                  alt={meme.user.name}
                />
                <AvatarFallback className="bg-linear-to-br from-primary/20 to-accent/20">
                  <User className="h-4 w-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col gap-0.5">
              <Link
                href={`/profile/${meme.user.id}`}
                className="font-medium text-sm leading-none transition-colors hover:text-primary"
              >
                {meme.user.name}
              </Link>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          {meme.category && (
            <Link href={`/search?category=${meme.category.slug}`}>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 gap-1 border font-medium text-xs uppercase tracking-wider transition-all hover:scale-105",
                  getCategoryStyles(meme.category.color),
                )}
              >
                {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                {meme.category.name}
              </Badge>
            </Link>
          )}
        </div>

        {/* Title (if exists) */}
        {meme.title && (
          <Link href={`/meme/${meme.id}`}>
            <h2 className="line-clamp-2 font-semibold text-base leading-snug transition-colors hover:text-primary md:text-lg">
              {meme.title}
            </h2>
          </Link>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Image */}
        <Link href={`/meme/${meme.id}`} className="block">
          <div className="relative overflow-hidden bg-muted/50">
            {/* biome-ignore lint/performance/noImgElement: <temp> */}
            <img
              src={meme.imageUrl || "/placeholder.svg"}
              alt={meme.title || `Meme ${meme.id}`}
              className="w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ maxHeight: "600px" }}
            />
            {/* Subtle gradient overlay on hover */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {/* Tags */}
        {meme.tags && meme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-border/30 border-t px-4 py-3">
            {meme.tags.slice(0, 5).map((tag) => {
              const TagIcon = getTagIcon(tag.slug);
              return (
                <Link key={tag.id} href={`/search?tags=${tag.slug}`}>
                  <Badge
                    variant={
                      activeTags?.includes(tag.slug)
                        ? "destructive"
                        : "secondary"
                    }
                    className="gap-1 bg-secondary/50 px-2 py-0.5 text-xs transition-colors hover:bg-primary/20 hover:text-primary"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </Badge>
                </Link>
              );
            })}
            {meme.tags.length > 5 && (
              <Badge
                variant="secondary"
                className="bg-secondary/50 px-2 py-0.5 text-muted-foreground text-xs"
              >
                +{meme.tags.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer - Actions */}
      <CardFooter className="flex items-center justify-between border-border/30 border-t">
        <div className="flex items-center gap-1">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="lg"
              className={`gap-2 ${likedState.isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart
                className={`h-5 w-5 ${likedState.isLiked ? "fill-current" : ""}`}
              />
              <span>{likedState.likesCount}</span>
            </Button>
          ) : (
            <AuthDialog>
              <Button
                variant="ghost"
                size="lg"
                className="cursor-pointer gap-2"
              >
                <Heart className="h-5 w-5" />
                <span>{meme.likesCount}</span>
              </Button>
            </AuthDialog>
          )}

          <Link href={`/meme/${meme.id}#comments`}>
            <Button size="sm" variant="ghost" className="gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium text-sm">{meme.commentsCount}</span>
            </Button>
          </Link>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          className="gap-1.5 transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500 text-xs">Copiado</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span className="hidden text-xs sm:inline">Compartir</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
