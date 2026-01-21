import { Button } from "@/shared/components/ui/button";
import type { Tag } from "@/types/tag";

export function TagsFilter({
  tags,
  selected,
  onSelect,
}: {
  tags: Tag[];
  selected: string[];
  onSelect: (tag: string) => void;
}) {
  if (!tags.length) return null;

  return (
    <div>
      <h2 className="mb-3 text-muted-foreground text-sm">Tags populares</h2>
      <div className="flex max-w-xl gap-2 overflow-x-auto">
        {tags.map((tag) => (
          <Button
            key={tag.id}
            size="sm"
            variant={selected.includes(tag.slug) ? "default" : "secondary"}
            onClick={() => onSelect(tag.slug)}
          >
            {tag.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
