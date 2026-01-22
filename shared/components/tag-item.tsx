"use client";

import type { Tag } from "@/types/tag";
import { useQueryParams } from "../hooks/use-query-params";
import { getTagIcon } from "../lib/tag-icons";
import { ToTitleCase } from "../utils";
import { Button, type ButtonVariants } from "./ui/button";

export const TagItem = ({
  tag,
  variant,
}: {
  tag: Tag;
  variant?: ButtonVariants;
}) => {
  const { toggleInArray, getArray } = useQueryParams();
  const selectedTags = getArray("tags");
  const TagIcon = getTagIcon(tag.slug);
  return (
    <Button
      key={tag.id}
      size="sm"
      variant={selectedTags.includes(tag.slug) ? "default" : variant || "ghost"}
      onClick={() => toggleInArray("tags", tag.slug)}
    >
      <TagIcon className="mr-2 h-4 w-4" />
      {ToTitleCase(tag.name)}
      {tag.memeCount && (
        <span className="ml-2 text-muted-foreground text-xs">
          {tag.memeCount}
        </span>
      )}
    </Button>
  );
};
