"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
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

export function Notifications() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    const data = await getNotifications(user.id);
    setNotifications(data);
  }, [user?.id]);

  // Refetch cuando cambia la ruta o el usuario
  useEffect(() => {
    startTransition(() => {
      fetchNotifications();
    });
  }, [pathname, fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  // Actualización optimista al marcar como leída
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
            onClick={() => startTransition(() => fetchNotifications())}
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-1 rounded-full bg-primary px-1 py-0.5 text-primary-foreground text-xs">
                {unreadCount}
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
              <DropdownMenuLabel>
                {isPending ? "Cargando..." : "No hay notificaciones"}
              </DropdownMenuLabel>
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
