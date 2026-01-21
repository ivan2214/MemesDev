import type { TimeRange } from "@/server/dal/memes";

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24 horas" },
  { value: "3d", label: "3 días" },
  { value: "7d", label: "7 días" },
  { value: "1m", label: "1 mes" },
  { value: "3m", label: "3 meses" },
  { value: "1y", label: "1 año" },
  { value: "all", label: "Todo" },
];
