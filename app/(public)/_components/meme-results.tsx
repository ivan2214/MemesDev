import { MemeCard } from "@/shared/components/meme-card";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Meme } from "@/types/meme";

export function MemeResults({
  memes,
  loading,
  hasMore,
  observerRef,
  activeTags,
}: {
  memes: Meme[];
  loading: boolean;
  hasMore: boolean;
  observerRef: React.RefObject<HTMLDivElement>;
  activeTags: string[];
}) {
  if (loading && memes.length === 0) {
    return <Spinner className="mx-auto h-8 w-8" />;
  }

  if (!memes.length) {
    return (
      <p className="text-center text-muted-foreground">No hay resultados</p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {memes.map((meme) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            isLiked={meme.isLiked}
            activeTags={activeTags}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      )}
    </>
  );
}
