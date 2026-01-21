import { Shuffle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shuffle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-balance font-bold text-3xl">Random Memes</h1>
            <p className="text-pretty text-muted-foreground text-sm">
              Descubre algo inesperado
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Shuffle className="h-4 w-4" />
          Mezclar
        </Button>
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
