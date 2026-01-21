// app/(whatever)/loading.tsx

import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Back button es estático */}
      <Button variant="ghost" className="mb-6 gap-2" disabled>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8">
        {/* Meme card */}
        <Card className="overflow-hidden p-0">
          {/* Imagen dinámica */}
          <div className="relative bg-muted">
            <Skeleton className="h-[60vh] w-full" />
          </div>

          <CardContent className="p-6">
            {/* Tags dinámicos */}
            <div className="mb-6 flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>

            <div className="flex items-center justify-between border-border border-t pt-4">
              {/* User info */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="lg" disabled className="gap-2">
                  <Heart className="h-5 w-5" />
                  <Skeleton className="h-4 w-6" />
                </Button>
                <Button variant="ghost" size="lg" disabled className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <Skeleton className="h-4 w-6" />
                </Button>
                <Button variant="ghost" size="lg" disabled>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div id="comments">
          {/* Título es estático */}
          <h2 className="mb-4 font-bold text-2xl">Comentarios</h2>

          {/* Form dinámico */}
          <div className="mb-6 space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Lista de comentarios */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
