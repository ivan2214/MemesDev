import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Notification } from "../types";
import { NotificationsContent } from "./notifications-content";
import { Button } from "./ui/button";

export function Notifications({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Bell className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <NotificationsContent notifications={notifications} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
