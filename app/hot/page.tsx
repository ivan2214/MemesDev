import { Flame } from "lucide-react";
import { MemeCard } from "@/shared/components/meme-card";
import { getHotMemes } from "./actions";

export default async function Page() {
  const { memes } = await getHotMemes({ offset: 0, limit: 12 });
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-balance font-bold text-4xl">Hot Memes</h1>
          <p className="text-pretty text-muted-foreground">
            Trending programming humor right now
          </p>
        </div>
      </div>

      {memes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {memes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} isLiked={meme.isLiked} />
          ))}
        </div>
      ) : (
        <p>No memes found</p>
      )}
    </div>
  );
}
