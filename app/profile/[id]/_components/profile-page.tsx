"use client";

import { Calendar, Heart, ImageIcon, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MemeCard } from "@/shared/components/meme-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Card } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import type { Meme } from "@/types/meme";
import type { UserProfile } from "@/types/profile";
import { getUserLikedMemes, getUserMemes } from "../_actions";

const PAGE_SIZE = 12;

export function ProfilePage({
  profile,
  initialUserMemes,
  initialLikedMemes,
  userId,
}: {
  profile: UserProfile;
  initialUserMemes: Meme[];
  initialLikedMemes: Meme[];
  userId: string;
}) {
  const [activeTab, setActiveTab] = useState("uploads");
  const [userMemes, setUserMemes] = useState<Meme[]>(initialUserMemes);
  const [likedMemes, setLikedMemes] = useState<Meme[]>(initialLikedMemes);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [loadingLiked, setLoadingLiked] = useState(false);
  const [hasMoreUploads, setHasMoreUploads] = useState(
    initialUserMemes.length >= PAGE_SIZE,
  );
  const [hasMoreLiked, setHasMoreLiked] = useState(
    initialLikedMemes.length >= PAGE_SIZE,
  );
  const [offsetUploads, setOffsetUploads] = useState(initialUserMemes.length);
  const [offsetLiked, setOffsetLiked] = useState(initialLikedMemes.length);
  const uploadsObserver = useRef<HTMLDivElement>(null);
  const likedObserver = useRef<HTMLDivElement>(null);

  const loadMoreUploads = useCallback(async () => {
    setLoadingUploads(true);
    try {
      const data = await getUserMemes(userId, offsetUploads, PAGE_SIZE);
      if (data.memes.length < PAGE_SIZE) {
        setHasMoreUploads(false);
      }
      setUserMemes((prev) => [...prev, ...data.memes]);
      setOffsetUploads((prev) => prev + data.memes.length);
    } catch (error) {
      console.error("Failed to load memes:", error);
    } finally {
      setLoadingUploads(false);
    }
  }, [userId, offsetUploads]);

  const loadMoreLiked = useCallback(async () => {
    setLoadingLiked(true);
    try {
      const data = await getUserLikedMemes(userId, offsetLiked, PAGE_SIZE);
      if (data.memes.length < PAGE_SIZE) {
        setHasMoreLiked(false);
      }
      setLikedMemes((prev) => [...prev, ...data.memes]);
      setOffsetLiked((prev) => prev + data.memes.length);
    } catch (error) {
      console.error("Failed to load liked memes:", error);
    } finally {
      setLoadingLiked(false);
    }
  }, [userId, offsetLiked]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreUploads &&
          !loadingUploads &&
          activeTab === "uploads"
        ) {
          loadMoreUploads();
        }
      },
      { threshold: 0.1 },
    );

    const target = uploadsObserver.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMoreUploads, loadingUploads, activeTab, loadMoreUploads]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreLiked &&
          !loadingLiked &&
          activeTab === "liked"
        ) {
          loadMoreLiked();
        }
      },
      { threshold: 0.1 },
    );

    const target = likedObserver.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMoreLiked, loadingLiked, activeTab, loadMoreLiked]);

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
                  Te registraste el{" "}
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
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {userMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
                ))}
              </div>
              {hasMoreUploads && (
                <div
                  ref={uploadsObserver}
                  className="mt-8 flex justify-center py-8"
                >
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </>
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
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {likedMemes.map((meme) => (
                  <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
                ))}
              </div>
              {hasMoreLiked && (
                <div
                  ref={likedObserver}
                  className="mt-8 flex justify-center py-8"
                >
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </>
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
