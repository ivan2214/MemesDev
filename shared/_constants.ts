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
