"use client";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@/lib/auth";
import { signOut } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const UserMenu = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
    toast.info("Hasta luego");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={"flex items-center gap-2"}
        render={<Button variant="ghost" size="icon" />}
      >
        {user?.image ? (
          <Avatar>
            <AvatarImage src={user.image} />
            <AvatarFallback>
              {user.name?.split(" ")[0].slice(0, 2) || "US"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <div className="flex items-center gap-2">
              {user?.image ? (
                <Avatar>
                  <AvatarImage src={user.image} />
                  <AvatarFallback>
                    {user.name?.split(" ")[0].slice(0, 2) || "US"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
              <div className="flex flex-col">
                <span className="line-clamp-3">
                  {user?.username || user?.name}
                </span>
                <p className="line-clamp-6 text-muted-foreground text-xs">
                  {user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full cursor-pointer hover:bg-accent">
          <Link className="w-full" href={`/profile/${user?.id}`}>
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="w-full cursor-pointer hover:bg-accent">
          <Link className="w-full" href={`/settings/profile`}>
            Configuración del perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full cursor-pointer hover:bg-accent"
          onClick={handleSignOut}
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
