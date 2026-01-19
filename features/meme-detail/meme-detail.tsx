"use client";

import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { AuthDialog, useAuth } from "@/features/auth/auth";

interface Meme {
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
  is_liked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

export function MemeDetail({ memeId }: { memeId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [meme, setMeme] = useState<Meme | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadMeme();
    loadComments();
  }, [memeId]);

  const loadMeme = async () => {
    try {
      const response = await fetch(`/api/memes/${memeId}`);
      if (!response.ok) throw new Error("Failed to fetch meme");

      const data = await response.json();
      setMeme(data.meme);
    } catch (error) {
      console.error("[v0] Failed to load meme:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/memes/${memeId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error("[v0] Failed to load comments:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !meme) return;

    try {
      const response = await fetch("/api/memes/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memeId: meme.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setMeme({
          ...meme,
          is_liked: data.liked,
          likes_count: data.likes_count,
        });
      }
    } catch (error) {
      console.error("[v0] Failed to like meme:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !meme) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/memes/${memeId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setCommentText("");
        setMeme({ ...meme, comments_count: meme.comments_count + 1 });
      }
    } catch (error) {
      console.error("[v0] Failed to post comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme?.title,
          text: meme?.description || meme?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Failed to share meme:", err);
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

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
          <Card className="overflow-hidden">
            <div className="relative bg-muted">
              {/** biome-ignore lint/performance/noImgElement: <temp> */}
              <img
                src={meme.image_url || "/placeholder.svg"}
                alt={meme.title}
                className="w-full object-contain"
                style={{ maxHeight: "80vh" }}
              />
            </div>
            <CardContent className="p-6">
              <h1 className="mb-3 text-balance font-bold text-3xl">
                {meme.title}
              </h1>
              {meme.description && (
                <p className="mb-4 text-pretty text-muted-foreground">
                  {meme.description}
                </p>
              )}
              {meme.tags && meme.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {meme.tags.map((tag) => (
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
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {meme.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{meme.user.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(meme.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`gap-2 ${meme.is_liked ? "text-red-500" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart
                        className={`h-5 w-5 ${meme.is_liked ? "fill-current" : ""}`}
                      />
                      <span>{meme.likes_count}</span>
                    </Button>
                  ) : (
                    <AuthDialog>
                      <Button variant="ghost" size="lg" className="gap-2">
                        <Heart className="h-5 w-5" />
                        <span>{meme.likes_count}</span>
                      </Button>
                    </AuthDialog>
                  )}
                  <Button variant="ghost" size="lg" className="gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>{meme.comments_count}</span>
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
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(comment.created_at).toLocaleDateString()}
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
