"use client";

import { Calendar, Heart, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemeCard } from "@/shared/components/meme-card";
import type { Meme } from "@/types/meme";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  memes_count: number;
  total_likes: number;
}

export function ProfilePage({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userMemes, setUserMemes] = useState<Meme[]>([]);
  const [likedMemes, setLikedMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("uploads");

  useEffect(() => {
    loadProfile();
    loadUserMemes();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("[v0] Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserMemes = async () => {
    try {
      const response = await fetch(`/api/profile/${userId}/memes`);
      if (!response.ok) throw new Error("Failed to fetch memes");

      const data = await response.json();
      setUserMemes(data.memes);
    } catch (error) {
      console.error("[v0] Failed to load user memes:", error);
    }
  };

  const loadLikedMemes = async () => {
    if (likedMemes.length > 0) return; // Already loaded

    try {
      const response = await fetch(`/api/profile/${userId}/liked`);
      if (!response.ok) throw new Error("Failed to fetch liked memes");

      const data = await response.json();
      setLikedMemes(data.memes);
    } catch (error) {
      console.error("[v0] Failed to load liked memes:", error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "liked") {
      loadLikedMemes();
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

        // Update in both lists
        setUserMemes((prev) =>
          prev.map((meme) =>
            meme.id === memeId
              ? { ...meme, is_liked: data.liked, likes_count: data.likes_count }
              : meme,
          ),
        );
        setLikedMemes((prev) =>
          prev.map((meme) =>
            meme.id === memeId
              ? { ...meme, is_liked: data.liked, likes_count: data.likes_count }
              : meme,
          ),
        );
      }
    } catch (error) {
      console.error("[v0] Failed to like meme:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card className="mb-8 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarFallback className="font-bold text-4xl">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="mb-2 text-balance font-bold text-3xl">
              {profile.name}
            </h1>
            <p className="mb-4 text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.memes_count}</strong> memes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.total_likes}</strong> likes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads">
          {userMemes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onLike={handleLike}
                  isLiked={meme.isLiked}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No memes uploaded yet
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked">
          {likedMemes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {likedMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onLike={handleLike}
                  isLiked={meme.isLiked}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <Heart className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No liked memes yet
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
