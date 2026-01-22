"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/shared/actions/meme-actions";
import { MemeShare } from "@/shared/components/meme-share";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { getCategoryStyles, getIconByName } from "@/shared/lib/tag-icons";
import type { Meme } from "@/types/meme";
import { useQueryParams } from "../hooks/use-query-params";
import { AuthDialog, useAuth } from "./auth-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MemeCardProps {
  meme: Meme;
  isLiked?: boolean;
  activeTags?: string[];
}

export function MemeCard({ meme, isLiked, activeTags }: MemeCardProps) {
  const { toggleInArray, set } = useQueryParams();

  const { user, isAuthenticated } = useAuth();
  const currentUserId = isAuthenticated ? user?.id : null;
  // Optimistic UI state
  const [likedState, setLikedState] = useState({
    isLiked: isLiked ?? meme?.isLiked ?? false,
    likesCount: meme?.likesCount,
  });

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      return toast.error("Debes iniciar sesión para dar like", {
        duration: 2000,
      });
    }
    if (currentUserId === meme?.user.id) {
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
      const { liked } = await toggleLike(meme?.id);

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
  }, [meme?.id, meme?.user.id, isAuthenticated, currentUserId, likedState]);

  const formattedDate = formatDistanceToNow(new Date(meme?.createdAt), {
    addSuffix: true,
    locale: es,
  });

  // Obtener icono de categoría si existe
  const CategoryIcon = meme?.category?.icon
    ? getIconByName(meme?.category.icon)
    : null;

  return (
    <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
        <Link
          href={`/profile/${meme?.user.id}`}
          className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
        >
          <Avatar className="h-9 w-9 shrink-0 border-2 border-primary/20 sm:h-10 sm:w-10">
            <AvatarImage
              src={meme?.user.image || "/placeholder.svg"}
              alt={meme?.user.name}
            />
            <AvatarFallback>{meme?.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="truncate font-semibold text-foreground text-sm sm:text-base">
                {meme?.user.name}
              </span>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">
              {formattedDate}
            </span>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Hide</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/meme/${meme?.id}`}>
        <div className="relative aspect-square h-full w-full bg-card">
          <Image
            src={meme?.imageUrl || "/placeholder.svg"}
            alt={meme?.title || ""}
            fill
            className="object-contain"
          />
        </div>
      </Link>

      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9",
                meme?.isLiked && "text-primary",
              )}
              onClick={handleLike}
            >
              <Heart
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  meme?.isLiked && "fill-current",
                )}
              />
            </Button>
          ) : (
            <AuthDialog>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 sm:h-9 sm:w-9",
                  meme?.isLiked && "text-primary",
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5",
                    meme?.isLiked && "fill-current",
                  )}
                />
              </Button>
            </AuthDialog>
          )}
          <Link href={`/meme/${meme?.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <MemeShare
            memeId={meme.id}
            memeTitle={meme.title || undefined}
            memeImageUrl={meme.imageUrl}
            userName={meme.user.name}
          >
            <Button variant="ghost" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </MemeShare>
          {/*     <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 ml-auto",
              meme?.isSaved && "text-primary",
            )}
            onClick={handleSave}
          >
            <Bookmark
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                meme?.isSaved && "fill-current",
              )}
            />
          </Button> */}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 font-semibold text-xs hover:bg-transparent disabled:cursor-pointer sm:text-sm"
            >
              {meme?.likesCount} likes
            </Button>
            <span className="text-muted-foreground text-xs">•</span>
            <Link href={`/meme/${meme?.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground text-xs hover:bg-transparent disabled:cursor-pointer sm:text-sm"
              >
                {meme?.commentsCount} comments
              </Button>
            </Link>
          </div>
          {/* category */}
          {meme.category && meme.category.slug && (
            <Button
              variant="ghost"
              onClick={() => set("category", meme.category?.slug || "")}
              className="h-auto p-0"
            >
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
            </Button>
          )}
          <Link href={`/meme/${meme?.id}`} className="block">
            <p className="wrap-break-word line-clamp-2 text-foreground text-xs sm:text-sm">
              {meme?.title}
            </p>
          </Link>
          <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
            {meme?.tags?.map((tag) => (
              <Button
                key={tag.id}
                variant="ghost"
                onClick={() => toggleInArray("tags", tag.slug)}
                className="h-auto p-0"
              >
                <Badge
                  variant={
                    activeTags?.includes(tag.slug) ? "default" : "outline"
                  }
                  className="text-xs"
                >
                  #{tag.name}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
