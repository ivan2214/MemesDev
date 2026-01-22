import { Bug, Code, Flame, Home, Shuffle, Terminal } from "lucide-react";
import type { SortType } from "@/shared/types";

export type ErrorType = "auth" | "default";

export const ErrorTypeMessages: Record<ErrorType, string> = {
  auth: "auth",
  default: "default",
} as const;

export const ERROR_MESSAGES: Record<
  ErrorType,
  { title: string; description: string }
> = {
  auth: {
    title: "Acceso Restringido",
    description:
      "Es necesario iniciar sesión para continuar. Se ha abierto el panel de autenticación automáticamente.",
  },
  default: {
    title: "Error Inesperado",
    description:
      "Ha ocurrido un error desconocido. Por favor, intenta de nuevo más tarde.",
  },
} as const;

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/hot", label: "Hot", icon: Flame },
  { href: "/random", label: "Random", icon: Shuffle },
];

export const CACHE_TAGS = {
  SYSTEM: "system",
  MEMES: "memes",
  CATEGORIES: "categories",
  TAGS: "tags",
  USERS: "users",
  LIKES: "likes",
  COMMENTS: "comments",
  USERS_TREND: "users-trend",
  NOTIFICATIONS: "notifications",
  // Helper for dynamic keys
  meme: (id: string) => `meme-${id}`,
  user: (id: string) => `user-${id}`,
  search: ({
    query,
    sort,
    tags,
    category,
    offset,
    limit,
    userId,
  }: {
    query?: string;
    sort: SortType;
    tags?: string[];
    category?: string;
    offset?: number;
    limit?: number;
    userId?: string;
  }) => {
    // Crear un objeto con solo los valores que existen
    const parts = [
      "search",
      query || "no-query",
      sort,
      tags?.join(",") || "no-tags",
      category || "no-category", // CAMBIO IMPORTANTE
      offset?.toString() || "0",
      limit?.toString() || "12",
      userId || "no-user",
    ];
    return parts.join("-");
  },
} as const;

export const CACHE_LIFE = {
  DEFAULT: "hours",
  SHORT: "minutes",
  LONG: "days",
  // Custom profiles if needed, but strings like 'hours' are standard in Next.js 16 cacheLife
} as const;

export const communities = [
  {
    title: "Backend Devs",
    url: "/community/backend",
    icon: Terminal,
  },
  {
    title: "Frontend Mafia",
    url: "/community/frontend",
    icon: Code,
  },
  {
    title: "The Bug Squadd",
    url: "/community/bugs",
    icon: Bug,
  },
] as const;

export const PAGE_SIZE = 12;
