import type React from "react";
import { db } from "@/db";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { Header } from "@/shared/components/header";
import { MobileNav } from "@/shared/components/mobile-nav";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function getCategories() {
  const categories = await db.query.categoriesTable.findMany();
  return categories;
}

export async function getBrowseTags() {
  const browseTags = await db.query.tagsTable.findMany();
  return browseTags;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const categories = await getCategories();
  const browseTags = await getBrowseTags();

  return (
    <SidebarProvider>
      <AppSidebar categories={categories} browseTags={browseTags} />
      <SidebarInset>
        <Header />

        {/* Main Content Column */}
        <main className="w-full max-w-2xl px-4 py-6 pb-20 md:pb-6">
          {children}
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
