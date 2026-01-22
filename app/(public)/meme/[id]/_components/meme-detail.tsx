"use client";

import { ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { addComment } from "@/shared/actions/meme-actions";
import { AuthDialog, useAuth } from "@/shared/components/auth-dialog";
import { MemeCard } from "@/shared/components/meme-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
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
      setCommentText("");
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

      <div className="grid gap-8">
        <div>
          <MemeCard meme={meme} isLiked={meme.isLiked} />
        </div>

        <div id="comments">
          <h2 className="mb-4 font-bold text-2xl">Comentarios</h2>

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
                  Inicia sesión para dejar un comentario
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
