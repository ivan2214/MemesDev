import {
  MessageSquare,
  Terminal,
  TerminalIcon,
  ThumbsUpIcon,
  TrendingUp,
} from "lucide-react";
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
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import type { Creator } from "../types";
import { ToTitleCase } from "../utils";
import { TagItem } from "./tag-item";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface RightSidebarProps {
  categories?: Category[];
  popularTags?: Tag[];
  creators?: Creator[];
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

  const displayTags: Tag[] = popularTags || DEFAULT_TAGS;

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
            <TagItem key={tag.id} tag={tag} variant="outline" />
          ))}
        </CardContent>
      </Card>

      {creators && creators.length > 0 && (
        <Card className="gap-0 border-border/40 bg-card/50">
          <CardHeader className="border-border/30 border-b">
            <CardTitle className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" />
              Creadores Sugeridos
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {creators?.map((creator) => {
              const CategoryIcon = creator?.category?.icon
                ? getIconByName(creator?.category.icon)
                : null;

              return (
                <div
                  key={creator.id}
                  className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4"
                >
                  <Link
                    href={`/profile/${creator.id}`}
                    className="flex flex-1 items-start gap-3"
                  >
                    <Avatar className="h-11 w-11 border-2 border-primary/20">
                      <AvatarImage
                        src={creator.image || "/placeholder.svg"}
                        alt={creator.name || "Creator avatar"}
                      />
                      <AvatarFallback>
                        {creator.username?.[0] || creator.name?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Nombre */}
                      <section className="flex flex-col items-start gap-y-1">
                        <p className="truncate font-semibold text-foreground text-sm">
                          {ToTitleCase(
                            (creator.username ?? creator.name) as string,
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2 text-muted-foreground text-xs">
                          <span className="flex items-center gap-1">
                            <TerminalIcon className="h-3 w-3" />{" "}
                            {creator.totalMemes} memes
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUpIcon className="h-3 w-3" />{" "}
                            {creator.totalLikes} likes
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />{" "}
                            {creator.totalComments} comentarios
                          </span>
                        </div>
                      </section>

                      {/* Tags y Categoría */}
                      {creator.tags && creator.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {creator.category && (
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 gap-1 border font-medium text-xs",
                                getCategoryStyles(creator.category.color),
                              )}
                            >
                              {CategoryIcon && (
                                <CategoryIcon className="h-3 w-3" />
                              )}
                              {creator.category.name}
                            </Badge>
                          )}

                          {creator.tags.slice(0, 4).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {creator.tags.length > 4 && (
                            <Badge className="text-xs">
                              +{creator.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-semibold text-primary">
            ● Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Estado:{" "}
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
            Usuarios:{" "}
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
