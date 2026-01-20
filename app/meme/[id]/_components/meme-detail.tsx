"use client";

import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { addComment, toggleLike } from "@/shared/actions/meme-actions";
import { AuthDialog, useAuth } from "@/shared/components/auth-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import type { Comment } from "@/types/comment";
import type { Meme } from "@/types/meme";

interface MemeDetailProps {
  memeId: string;
  meme: Meme;
  comments: Comment[];
}

export function MemeDetail({ memeId, meme, comments }: MemeDetailProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) return;

    try {
      const result = await toggleLike(memeId);
      toast.success(result.liked ? "Liked" : "Unliked");
    } catch (error) {
      console.error("Failed to like meme:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addComment(memeId, commentText);
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          url: window.location.href,
        });
      } catch (err) {
        console.error("Failed to share meme:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (!meme) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Meme not found</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <Card className="overflow-hidden p-0">
            <div className="relative bg-muted">
              {/** biome-ignore lint/performance/noImgElement: <temp> */}
              <img
                src={meme.imageUrl || "/placeholder.svg"}
                alt={meme.id}
                className="w-full object-contain"
                style={{ maxHeight: "80vh" }}
              />
            </div>
            <CardContent className="p-6">
              {meme.tags && meme.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {meme.tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/search?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-sm transition-colors hover:bg-secondary/80"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-border border-t pt-4">
                <Link
                  href={`/profile/${meme.user.id}`}
                  className="flex items-center gap-3"
                >
                  {meme.user.image ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={meme.user.image || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {meme.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={"https://i.pravatar.cc/300"} />
                      <AvatarFallback>
                        {meme.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <p className="font-medium">{meme.user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(meme.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`gap-2 ${meme.isLiked ? "text-red-500" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart
                        className={`h-5 w-5 ${meme.isLiked ? "fill-current" : ""}`}
                      />
                      <span>{meme.likesCount}</span>
                    </Button>
                  ) : (
                    <AuthDialog>
                      <Button variant="ghost" size="lg" className="gap-2">
                        <Heart className="h-5 w-5" />
                        <span>{meme.likesCount}</span>
                      </Button>
                    </AuthDialog>
                  )}
                  <Button variant="ghost" size="lg" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>{meme.commentsCount}</span>
                  </Button>
                  <Button variant="ghost" size="lg" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div id="comments">
          <h2 className="mb-4 font-bold text-2xl">Comments</h2>

          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mb-2"
                rows={3}
              />
              <Button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <AuthDialog>
              <Card className="mb-6 cursor-pointer p-4 transition-colors hover:bg-muted/50">
                <p className="text-muted-foreground text-sm">
                  Sign in to leave a comment
                </p>
              </Card>
            </AuthDialog>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="mb-2 flex items-start gap-3">
                  {comment.user.image ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={comment.user.image || "/placeholder.svg"}
                      />
                      <AvatarFallback className="text-xs">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"https://i.pravatar.cc/300"} />
                      <AvatarFallback className="text-xs">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-pretty text-sm">{comment.content}</p>
                  </div>
                </div>
              </Card>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
