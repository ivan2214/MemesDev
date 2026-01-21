import { Flame } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { TIME_RANGES } from "./_constants";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-balance font-bold text-3xl">Hot Memes</h1>
            <p className="text-pretty text-muted-foreground text-sm">
              Los memes más populares
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((range) => (
            <Button key={range.value} size="sm" variant="outline">
              {range.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
