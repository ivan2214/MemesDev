"use client";

import { Calendar, Heart, ImageIcon, User } from "lucide-react";
import { useState } from "react";
import { MemeCard } from "@/shared/components/meme-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import type { Meme } from "@/types/meme";
import type { UserProfile } from "@/types/profile";

export function ProfilePage({
  profile,
  userMemes,
  likedMemes,
}: {
  profile: UserProfile;
  userMemes: Meme[];
  likedMemes: Meme[];
}) {
  const [activeTab, setActiveTab] = useState("uploads");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
          {profile?.image ? (
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.image} />
              <AvatarFallback>
                {profile.name.split(" ")[0].slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-4 w-4" />
          )}

          <div className="flex-1 text-center sm:text-left">
            <h1 className="mb-2 text-balance font-bold text-3xl">
              {profile.name}
            </h1>
            <p className="mb-4 text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.memesCount}</strong> memes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.totalLikes}</strong> likes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  Te registraste el
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="uploads">Subidos</TabsTrigger>
          <TabsTrigger value="liked">Me gustan</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads">
          {userMemes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  /* onLike={handleLike} */
                  isLiked={meme.isLiked}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No hay memes subidos todavía
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
                  /* onLike={handleLike} */
                  isLiked={meme.isLiked}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
              <Heart className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">
                No has likeado todavía
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
