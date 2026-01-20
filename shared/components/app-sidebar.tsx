"use client";

import {
  ChevronDown,
  Code2,
  Flame,
  Home,
  Route,
  Search,
  Shuffle,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/shared/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_TAGS,
  getCategoryStyles,
  getIconByName,
  getTagIcon,
} from "@/shared/lib/tag-icons";
import type { Category, Tag } from "@/types/meme";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/hot", label: "Hot", icon: Flame },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/random", label: "Random", icon: Shuffle },
  { href: "/upload", label: "Subir", icon: Upload },
];

interface AppSidebarProps {
  categories?: Category[];
  browseTags?: Tag[];
}

export function AppSidebar({ categories, browseTags }: AppSidebarProps) {
  const pathname = usePathname();

  // Usar defaults si no se proporcionan datos de DB
  const displayCategories =
    categories ||
    DEFAULT_CATEGORIES.map((c, i) => ({
      id: `default-${i}`,
      ...c,
    }));

  const displayTags =
    browseTags ||
    DEFAULT_TAGS.map((t, i) => ({
      id: `default-${i}`,
      ...t,
    }));

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

      <SidebarContent className="gap-0">
        {/* Navigation */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Rutas
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton isActive={isActive} className="py-0">
                          <Link
                            href={item.href}
                            className="flex h-full w-full items-center gap-2"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Browse Tags */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  EXPLORAR
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {displayTags.map((tag) => {
                    const TagIcon = getTagIcon(tag.slug);
                    return (
                      <SidebarMenuItem key={tag.id}>
                        <SidebarMenuButton className="py-0">
                          <Link
                            href={`/search?tag=${tag.slug}`}
                            className="flex h-full w-full items-center gap-2"
                          >
                            <TagIcon className="h-4 w-4" />
                            <span>{tag.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="py-0">
                      <Link
                        href="/search"
                        className="w-full text-primary hover:text-primary"
                      >
                        Ver todos →
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Categories */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  CATEGORÍAS
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="pt-2">
                <div className="flex flex-wrap gap-1.5 px-2">
                  {displayCategories.map((category) => {
                    const CategoryIcon = getIconByName(category.icon);
                    return (
                      <Link
                        key={category.id}
                        href={`/search?category=${category.slug}`}
                      >
                        <Badge
                          variant="outline"
                          className={`cursor-pointer gap-1 border font-medium text-[10px] transition-all hover:scale-105 ${getCategoryStyles(category.color)}`}
                        >
                          <CategoryIcon className="h-3 w-3" />
                          {category.name}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
