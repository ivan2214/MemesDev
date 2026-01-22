"use client";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import type { Notification } from "../types";

interface NotificationsProps {
  notifications: Notification[];
}

export function NotificationsContent({ notifications }: NotificationsProps) {
  return (
    <>
      {notifications.length === 0 && (
        <DropdownMenuItem>No hay notificaciones</DropdownMenuItem>
      )}
      {notifications.map((notification, index) => (
        <DropdownMenuGroup key={notification.id}>
          <DropdownMenuCheckboxItem
            checked={notification.read}
            onCheckedChange={() => {}}
          >
            <DropdownMenuItem className="flex items-center gap-2">
              <DropdownMenuLabel className="font-bold">
                {notification.type}
              </DropdownMenuLabel>
              <span>{notification.message}</span>
            </DropdownMenuItem>
          </DropdownMenuCheckboxItem>
          {index < notifications.length - 1 && <DropdownMenuSeparator />}
        </DropdownMenuGroup>
      ))}
    </>
  );
}
