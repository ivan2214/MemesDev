"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  getCategoryStyles,
  getIconByName,
} from "@/shared/lib/tag-icons";
import type { Category, Tag } from "@/types/meme";

interface RightSidebarProps {
  categories?: Category[];
  popularTags?: Tag[];
}

export function RightSidebar({ categories, popularTags }: RightSidebarProps) {
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
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="border-border/30 border-b p-4">
          <h3 className="font-semibold text-sm">Categorías</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 p-4">
          {displayCategories.map((category) => {
            const CategoryIcon = getIconByName(category.icon);
            return (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
              >
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
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="border-border/30 border-b p-4">
          <h3 className="font-semibold text-sm">Tags Populares</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5 p-4">
          {displayTags.map((tag) => (
            <Link key={tag.id} href={`/search?tag=${tag.slug}`}>
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
    </aside>
  );
}
