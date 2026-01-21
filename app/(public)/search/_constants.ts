import type { SortType } from "./_actions";

export const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "recent", label: "Más recientes" },
  { value: "likes", label: "Más likes" },
  { value: "comments", label: "Más comentarios" },
];
