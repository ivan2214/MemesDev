"use client";

import { Flame, Home, Search, Shuffle, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/hot", label: "Hot", icon: Flame },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/random", label: "Random", icon: Shuffle },
  { href: "/upload", label: "Subir", icon: Upload },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-border/40 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 lg:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-current")}
              />
              <span className="font-medium text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
