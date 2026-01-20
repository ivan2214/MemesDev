"use client";

import { GithubIcon, LogInIcon, LogOut, UploadIcon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/auth-client";
import { AuthDialog, useAuth } from "@/shared/components/auth-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UploadDialog } from "./upload-dialog";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hidden md:flex" />
          <Link
            href="/"
            className="flex items-center gap-2 font-bold font-mono text-xl md:hidden"
          >
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              DevMemes
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="https://github.com/ivan2214/MemesDev">
            <Button size="icon" variant="outline">
              <GithubIcon className="h-4 w-4" />
            </Button>
          </Link>
          {isAuthenticated ? (
            <section className="flex items-center gap-2">
              {user ? (
                <UploadDialog>
                  <Button size="sm">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Subir meme
                  </Button>
                </UploadDialog>
              ) : (
                <AuthDialog>
                  <Button size="sm">
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Subir meme
                  </Button>
                </AuthDialog>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={
                    "flex cursor-pointer items-center gap-2 bg-transparent"
                  }
                >
                  {user?.image ? (
                    <Avatar>
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name.split(" ")[0].slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4" />
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
            </section>
          ) : (
            <AuthDialog>
              <Button size="sm">
                <LogInIcon className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            </AuthDialog>
          )}
        </div>
      </div>
    </header>
  );
}
