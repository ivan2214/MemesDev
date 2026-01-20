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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 hidden h-[calc(100vh-4rem)] w-64 border-border/40 border-r bg-sidebar lg:block">
      <div className="flex h-full flex-col gap-2 p-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
