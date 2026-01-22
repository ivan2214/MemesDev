"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getNotifications } from "../actions/notifications-actions";
import type { Notification } from "../types";
import { useAuth } from "./auth-dialog";
import { NotificationItem } from "./notifications-item";
import { Button } from "./ui/button";

const MINUTES_DEFAULT = 0;
const SECONDS_DEFAULT = 1;

const CACHE_DURATION_IN_SECONDS =
  (MINUTES_DEFAULT === 0 ? SECONDS_DEFAULT : MINUTES_DEFAULT) * 60;

const CACHE_DURATION_IN_MILLISECONDS = CACHE_DURATION_IN_SECONDS * 1000;

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastFetchTime = useRef<number>(0);
  const isLoading = useRef(false);

  const handleNotifications = useCallback(async () => {
    if (!user?.id) return;

    const now = Date.now();
    // Evitar llamadas si ya está cargando o si aún no expiró el caché
    if (
      isLoading.current ||
      now - lastFetchTime.current < CACHE_DURATION_IN_MILLISECONDS
    ) {
      return;
    }

    isLoading.current = true;
    try {
      const newNotifications = await getNotifications(user.id);
      setNotifications(newNotifications);
      lastFetchTime.current = now;
    } finally {
      isLoading.current = false;
    }
  }, [user?.id]);

  // Petición inicial al montar el componente
  useEffect(() => {
    handleNotifications();
  }, [handleNotifications]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.read);
  }, [notifications]);

  // Actualiza el estado local cuando se marca como leída
  const handleMarkAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            onClick={handleNotifications}
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications.length > 0 && (
              <span className="absolute -top-2 -right-1 rounded-full bg-primary px-1 py-0.5 text-primary-foreground text-xs">
                {unreadNotifications.length}
              </span>
            )}
          </Button>
        }
      />

      <DropdownMenuContent
        className="h-fit max-h-80 w-80 overflow-y-auto p-4"
        align="end"
      >
        <DropdownMenuGroup className="flex w-full flex-col gap-2">
          {notifications.length === 0 ? (
            <DropdownMenuItem>
              <DropdownMenuLabel>No hay notificaciones</DropdownMenuLabel>
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkedAsRead={handleMarkAsRead}
              />
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
