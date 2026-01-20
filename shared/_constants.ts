import { Flame, Home, Search, Shuffle, Upload } from "lucide-react";

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

export const navItems = (isAuthenticated: boolean) => {
  const items = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/hot", label: "Hot", icon: Flame },
    { href: "/search", label: "Buscar", icon: Search },
    { href: "/random", label: "Random", icon: Shuffle },
  ];

  if (isAuthenticated) {
    items.push({ href: "/upload", label: "Subir", icon: Upload });
  }

  return items;
};
