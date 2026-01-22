"use client";

import { ChevronDown, Flame, Route, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { navItems } from "../constants";
import { useQueryParams } from "../hooks/use-query-params";
import { Button } from "./ui/button";

interface AppSidebarProps {
  categories?: Category[];
  browseTags?: Tag[];
}

export function AppSidebar({ categories, browseTags }: AppSidebarProps) {
  const pathname = usePathname();
  const { set, toggleInArray, getArray, get } = useQueryParams();

  // Usar defaults si no se proporcionan datos de DB
  const displayCategories =
    categories ||
    DEFAULT_CATEGORIES.map((c, i) => ({
      id: `default-${i}`,
      ...c,
    }));

  const displayTags = browseTags || DEFAULT_TAGS;

  return (
    <Sidebar>
      <SidebarHeader className="border-border/40 border-b p-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold font-mono text-lg"
        >
          <Image src="/logo-rb.png" alt="Logo" width={60} height={60} />
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            MemesDev
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
                    const isActive = getArray("tags").includes(tag.slug);
                    return (
                      <SidebarMenuItem key={tag.id}>
                        <SidebarMenuButton
                          className="cursor-pointer py-0"
                          onClick={() => toggleInArray("tags", tag.slug)}
                          isActive={isActive}
                        >
                          <TagIcon className="h-4 w-4" />
                          <span>{tag.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="py-0">
                      <Link
                        href="/"
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
                    const isActive = get("category") === category.slug;
                    const styles = getCategoryStyles(category.color);
                    return (
                      <Button
                        key={category.id}
                        onClick={() => set("category", category.slug)}
                        variant="ghost"
                        className={cn(
                          `cursor-pointer gap-1 border font-medium text-[10px] transition-all hover:scale-105`,
                          isActive && styles,
                        )}
                        size="xs"
                      >
                        <CategoryIcon className="h-3 w-3" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {/* communities in the future */}
        {/*   <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>
              <CollapsibleTrigger className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Comunidades
                </span>
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="pt-2">
                <div className="flex flex-wrap gap-1.5 px-2">
                  {communities.map((community) => {
                    return (
                      <Link key={community.url} href={community.url}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer gap-1 border font-medium text-[10px] transition-all hover:scale-105"
                        >
                          {community.icon && (
                            <community.icon className="h-3 w-3" />
                          )}
                          {community.title}
                        </Badge>
                      </Link>
                    );
                  })}
                </div>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible> */}
      </SidebarContent>
    </Sidebar>
  );
}
