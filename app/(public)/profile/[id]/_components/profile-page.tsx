"use client";

import { Calendar, Heart, ImageIcon, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User as CurrentUser } from "@/lib/auth";
import { EditProfileDialog } from "@/shared/components/edit-profile-dialog";
import { MemeCard } from "@/shared/components/meme-card";
import { TagItem } from "@/shared/components/tag-item";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { PAGE_SIZE } from "@/shared/constants";
import type { CategoryForm, Creator, TagForForm } from "@/shared/types";
import type { Meme } from "@/types/meme";
import { getUserMemes } from "../_actions";

export function ProfilePage({
  profile,
  initialUserMemes,
  categoriesDB,
  tagsDB,
  currentUser,
}: {
  profile: Creator;
  initialUserMemes: Meme[];
  tagsDB: TagForForm[];
  categoriesDB: CategoryForm[];
  currentUser?: CurrentUser;
}) {
  const [userMemes, setUserMemes] = useState<Meme[]>(initialUserMemes);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [hasMoreUploads, setHasMoreUploads] = useState(
    initialUserMemes.length >= PAGE_SIZE,
  );
  const [offsetUploads, setOffsetUploads] = useState(initialUserMemes.length);
  const uploadsObserver = useRef<HTMLDivElement>(null);

  const loadMoreUploads = useCallback(async () => {
    setLoadingUploads(true);
    try {
      const data = await getUserMemes(
        profile.id as string,
        offsetUploads,
        PAGE_SIZE,
      );
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
  }, [profile.id, offsetUploads]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreUploads && !loadingUploads) {
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
  }, [hasMoreUploads, loadingUploads, loadMoreUploads]);

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
                {profile.name?.split(" ")[0].slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserIcon className="h-4 w-4" />
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-balance font-bold text-2xl">
                {profile.name}
              </h1>
              {profile.category && (
                <Badge variant="secondary" className="text-sm">
                  {profile.category.name}
                </Badge>
              )}
              {profile.id === currentUser?.id && (
                <EditProfileDialog
                  categoriesDB={categoriesDB}
                  currentUser={currentUser}
                  tagsDB={tagsDB}
                />
              )}
            </div>

            <p className="mb-2 text-muted-foreground">@{profile.name}</p>

            {profile.bio && (
              <p className="mb-4 max-w-xl text-center text-sm sm:text-left">
                {profile.bio}
              </p>
            )}

            {profile.tags && profile.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile.tags.map((tag) => (
                  <TagItem key={tag.id} tag={tag} variant="outline" />
                ))}
              </div>
            )}

            {profile.socials && profile.socials.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                {profile.socials.map((social) => (
                  <Link
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary text-sm hover:underline"
                  >
                    {/* Maybe try to match icon? For now just text/link */}
                    {social.platform || "Link"}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{profile.totalMemes}</strong> memes
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
                  {profile.id === currentUser?.id
                    ? "Te registraste el"
                    : "Registrado el "}
                  {new Date(profile?.createdAt || "").toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {userMemes.length > 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-bold text-2xl">
              Memes publicados por {profile.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-5">
            <div className="flex flex-col gap-6">
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
          </CardContent>
        </Card>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
          <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-lg text-muted-foreground">
            No hay memes subidos todavía
          </p>
        </div>
      )}
    </div>
  );
}
