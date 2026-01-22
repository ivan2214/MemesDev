"use client";

import { Terminal, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  getCategoryStyles,
  getIconByName,
} from "@/shared/lib/tag-icons";
import type { User } from "@/shared/types";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface RightSidebarProps {
  categories?: Category[];
  popularTags?: Tag[];
  creators?: User[];
  systemStatus?: {
    status: boolean;
    users: number;
    memes: number;
  };
}

export function RightSidebar({
  categories,
  popularTags,
  creators,
  systemStatus,
}: RightSidebarProps) {
  // Usar defaults si no se proporcionan datos de DB
  const displayCategories =
    categories ||
    DEFAULT_CATEGORIES.map((c, i) => ({
      id: `default-${i}`,
      ...c,
    }));

  const displayTags =
    popularTags ||
    DEFAULT_TAGS.map((t, i) => ({
      id: `default-${i}`,
      ...t,
    }));

  return (
    <aside className="sticky top-20 hidden w-80 shrink-0 space-y-6 lg:block">
      {/* Anuncios */}
      {/* <Card className="overflow-hidden border-border/40 bg-linear-to-br from-card to-card/80">
        <CardHeader className="flex flex-row items-center gap-2 border-border/30 border-b p-4">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-sm">Anuncios</h3>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="group relative overflow-hidden rounded-lg bg-linear-to-br from-primary/10 via-accent/10 to-primary/10 p-4">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
              <h4 className="mb-1 font-semibold text-primary">
                Tu Anuncio Aquí
              </h4>
              <p className="text-muted-foreground text-xs">
                Llega a miles de desarrolladores y programadores.
              </p>
              <Link
                href="/advertise"
                className="mt-3 inline-flex items-center gap-1 text-primary text-xs transition-colors hover:underline"
              >
                Más información
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-lg border border-border/40 bg-card/50 p-4">
              <h4 className="mb-1 font-medium text-sm">
                ¿Quieres aparecer aquí?
              </h4>
              <p className="text-muted-foreground text-xs">
                Contacta para promocionar tu producto o servicio.
              </p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Categorías */}
      <Card className="gap-0 border-border/40 bg-card/50">
        <CardHeader className="border-border/30 border-b">
          <CardTitle className="font-semibold">Categorías</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {displayCategories.map((category) => {
            const CategoryIcon = getIconByName(category.icon);
            return (
              <Link key={category.id} href={`/?category=${category.slug}`}>
                <Badge
                  variant="outline"
                  className={`cursor-pointer gap-1 border font-medium text-xs transition-all hover:scale-105 ${getCategoryStyles(category.color)}`}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {category.name}
                </Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Tags populares */}
      <Card className="gap-0 border-border/40 bg-card/50">
        <CardHeader className="border-border/30 border-b">
          <CardTitle className="font-semibold">Tags Populares</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {displayTags.map((tag) => (
            <Link key={tag.id} href={`/?tags=${tag.slug}`}>
              <Badge
                variant="secondary"
                className="cursor-pointer bg-secondary/50 text-xs transition-colors hover:bg-primary/20 hover:text-primary"
              >
                #{tag.name}
              </Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      {creators && creators.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Suggested Creators
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {creators?.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between"
              >
                <Link
                  href={`/profile/${creator.id}`}
                  className="flex flex-1 items-center gap-3"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={creator.image || "/placeholder.svg"}
                      alt={creator.name}
                    />
                    <AvatarFallback>{creator.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground text-sm">
                      {creator.username || creator.name}
                    </p>
                    {creator.bio && (
                      <p className="line-clamp-6 text-muted-foreground text-xs">
                        {creator.bio}
                      </p>
                    )}
                  </div>
                </Link>
                <Button
                  size="sm"
                  className="shrink-0 bg-primary hover:bg-primary/90"
                >
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-semibold text-primary">
            ● SYSTEM STATUS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Status:{" "}
            <Badge
              variant={systemStatus?.status ? "ghost" : "destructive"}
              className={cn(
                "font-semibold",
                systemStatus?.status ? "bg-green-500 text-muted" : "bg-red-500",
              )}
            >
              {systemStatus?.status ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Users:{" "}
            <Badge variant="outline" className="font-semibold">
              {systemStatus?.users}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Memes:{" "}
            <Badge variant="outline" className="font-semibold">
              {systemStatus?.memes}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
