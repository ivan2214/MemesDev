import { Bell } from "lucide-react";

import { getNotifications } from "@/server/dal/users";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { NotificationsContent } from "./notifications-content";
import { Button } from "./ui/button";

export async function Notifications() {
  const notifications = await getNotifications();

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
