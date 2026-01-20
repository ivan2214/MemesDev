"use client";

import { Code2, Flame, Home, Search, Shuffle, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/hot", label: "Hot", icon: Flame },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/random", label: "Random", icon: Shuffle },
  { href: "/upload", label: "Subir", icon: Upload },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-border/40 border-b p-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold font-mono text-lg"
        >
          <Code2 className="h-5 w-5 text-primary" />
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            DevMemes
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={isActive}>
                      <Link
                        className="flex w-full items-center gap-2"
                        href={item.href}
                        title={item.label}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-base">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
