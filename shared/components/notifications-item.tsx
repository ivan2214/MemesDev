"use client";

import {
  Bell,
  Check,
  ExternalLink,
  Heart,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/shared/components/ui/dropdown-menu";
import { markNotificationAsRead } from "../actions/notifications-actions";
import type { Notification } from "../types";
import { formatDate } from "../utils";
import { Button } from "./ui/button";

interface NotificationsProps {
  notification: Notification;
  onMarkedAsRead?: (notificationId: string) => void;
}

const typeIconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  system: Bell,
} as const;

const typeColorMap = {
  like: "text-rose-500 bg-rose-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-emerald-500 bg-emerald-500/10",
  system: "text-amber-500 bg-amber-500/10",
} as const;

export function NotificationItem({
  notification,
  onMarkedAsRead,
}: NotificationsProps) {
  const onMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { message, success } = await markNotificationAsRead(notificationId);
    if (!success) {
      toast.error(message);
    } else {
      toast.success(message);
      onMarkedAsRead?.(notificationId);
    }
  };

  const Icon = typeIconMap[notification.type ?? "system"];
  const colorClass = typeColorMap[notification.type ?? "system"];

  return (
    <DropdownMenuItem
      className={cn(
        "cursor-pointer p-2 focus:bg-accent/50",
        !notification.read && "border-l-2 border-l-primary bg-primary/5",
      )}
    >
      <div className="flex w-full items-start gap-2">
        {/* Icono con indicador de tipo */}
        <div
          className={cn(
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            colorClass,
          )}
        >
          <Icon className="h-4 w-4" />
          {/* Indicador de no leído */}
          {!notification.read && (
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          )}
        </div>

        {/* Contenido principal */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {/* Mensaje de la notificación */}
          <p
            className={cn(
              "line-clamp-2 text-xs leading-snug",
              !notification.read
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {notification.message}
          </p>

          {/* Fecha */}
          <span className="text-[10px] text-muted-foreground/70">
            {formatDate(notification.createdAt)}
          </span>

          {/* Acciones */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {/* Botón ir al detalle */}
            {notification.link && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-[10px]"
                render={
                  <Link href={notification.link}>
                    <ExternalLink className="h-3 w-3" />
                    Ver
                  </Link>
                }
              />
            )}

            {/* Botón marcar como leída */}
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={(e) => onMarkAsRead(e, notification.id)}
              >
                <Check className="h-3 w-3" />
                Leída
              </Button>
            )}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
