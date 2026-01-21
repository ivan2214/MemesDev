import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="mb-2 text-balance font-bold text-4xl">Últimos Memes</h1>
        <p className="text-pretty text-muted-foreground">
          Memes de programación frescos de la comunidad
        </p>
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
