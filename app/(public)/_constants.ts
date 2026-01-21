import type { SortType } from "@/shared/types";

export const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "likes", label: "Más likes" },
  { value: "comments", label: "Más comentarios" },
];
