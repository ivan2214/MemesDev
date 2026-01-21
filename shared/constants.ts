import { Flame, Home, Search, Shuffle } from "lucide-react";

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
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/random", label: "Random", icon: Shuffle },
];

export const CACHE_TAGS = {
  MEMES: "memes",
  CATEGORIES: "categories",
  TAGS: "tags",
  USERS: "users",
  LIKES: "likes",
  COMMENTS: "comments",
  // Helper for dynamic keys
  meme: (id: string) => `meme-${id}`,
  user: (id: string) => `user-${id}`,
} as const;

export const CACHE_LIFE = {
  DEFAULT: "hours",
  SHORT: "minutes",
  LONG: "days",
  // Custom profiles if needed, but strings like 'hours' are standard in Next.js 16 cacheLife
} as const;
