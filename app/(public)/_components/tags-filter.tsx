import { TagItem } from "@/shared/components/tag-item";
import type { Tag } from "@/types/tag";

export function TagsFilter({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;

  return (
    <div>
      <h2 className="mb-3 text-muted-foreground text-sm">Tags populares</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          return <TagItem key={tag.id} tag={tag} />;
        })}
      </div>
    </div>
  );
}
