import { SearchIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SORT_OPTIONS } from "./_constants";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-balance font-bold text-2xl">Buscar Memes</h1>
        <form className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por tags..."
              className="pr-10 pl-10"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>

        {/* Sort Options */}
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <Button key={option.value} size="sm" variant="outline">
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 font-medium text-muted-foreground text-sm">
          Tags populares
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-16" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
