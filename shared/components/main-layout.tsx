import type React from "react";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { getAllCategories, getPopularTags } from "@/server/dal/categories";
import { getSystemStatus } from "@/server/dal/system";
import { getTrendCreators } from "@/server/dal/users";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { RightSidebar } from "./right-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  showRightSidebar: boolean;
}

export async function MainLayout({
  children,
  showRightSidebar,
}: MainLayoutProps) {
  const categories = await getAllCategories();
  const tags = await getPopularTags();
  const creators = showRightSidebar ? await getTrendCreators() : undefined;
  const systemStatus = showRightSidebar ? await getSystemStatus() : undefined;

  return (
    <Suspense fallback={<div className="min-h-screen bg-sidebar" />}>
      <SidebarProvider>
        <AppSidebar categories={categories} browseTags={tags} />
        <SidebarInset>
          <Header />
          <div
            className={cn(
              showRightSidebar && "flex justify-center gap-8",
              "px-4 py-6 pb-20 md:pb-6",
            )}
          >
            <main className="flex w-full max-w-2xl flex-col">{children}</main>

            {showRightSidebar && (
              <RightSidebar creators={creators} systemStatus={systemStatus} />
            )}
          </div>
        </SidebarInset>
        <MobileNav />
      </SidebarProvider>
    </Suspense>
  );
}
