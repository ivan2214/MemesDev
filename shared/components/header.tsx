"use client";

import { Code2, LogOut, Upload, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthDialog, useAuth } from "@/features/auth/auth";
import { signOut } from "@/lib/auth/auth-client";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold font-mono text-xl"
        >
          <Code2 className="h-6 w-6 text-primary" />
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            DevMemes
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/hot"
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            Hot
          </Link>
          <Link
            href="/search"
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            Search
          </Link>
          <Link
            href="/random"
            className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            Random
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/upload">
                <Button size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={"flex items-center gap-2 bg-transparent"}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href={`/profile/${user?.id}`}>My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <AuthDialog>
              <Button size="sm">Sign In</Button>
            </AuthDialog>
          )}
        </div>
      </div>
    </header>
  );
}
