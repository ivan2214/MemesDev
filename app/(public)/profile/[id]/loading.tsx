import { Calendar, Heart, ImageIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Profile card */}
      <Card className="mb-8 p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full" />

          <div className="flex-1 text-center sm:text-left">
            {/* Name + category */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Email */}
            <Skeleton className="mt-2 h-4 w-56" />

            {/* Bio */}
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-5/6 max-w-xl" />
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 rounded" />
              ))}
            </div>

            {/* Social links */}
            <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16 rounded" />
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* User memes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">
            <Skeleton className="h-8 w-80" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
