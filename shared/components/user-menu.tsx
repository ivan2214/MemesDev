"use client";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/auth";
import { signOut } from "@/lib/auth/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const UserMenu = ({ user }: { user: User }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={"flex cursor-pointer items-center gap-2 bg-transparent"}
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
        <span className="hidden sm:inline">{user?.name}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem className="w-full cursor-pointer hover:bg-accent">
          <Link className="w-full" href={`/profile/${user?.id}`}>
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
