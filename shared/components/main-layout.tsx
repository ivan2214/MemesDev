import { UploadIcon } from "lucide-react";
import type React from "react";
import { getCurrentUser } from "@/data/user";
import { db } from "@/db";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AuthDialog } from "./auth-dialog";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { RightSidebar } from "./right-sidebar";
import { Button } from "./ui/button";
import { UploadDialog } from "./upload-dialog";

interface MainLayoutProps {
  children: React.ReactNode;
  showRightSidebar: boolean;
}

export async function getCategories() {
  const categories = await db.query.categoriesTable.findMany();
  return categories;
}

export async function getBrowseTags() {
  const browseTags = await db.query.tagsTable.findMany();
  return browseTags;
}

export async function MainLayout({
  children,
  showRightSidebar,
}: MainLayoutProps) {
  const categories = await getCategories();
  const browseTags = await getBrowseTags();
  const user = await getCurrentUser();
  return (
    <SidebarProvider>
      <AppSidebar categories={categories} browseTags={browseTags} />
      <SidebarInset>
        <Header />
        <div
          className={cn(
            showRightSidebar && "flex justify-center gap-8",
            "px-4 py-6 pb-20 md:pb-6",
          )}
        >
          {/* Main Content Column */}
          <main className="flex w-full max-w-2xl flex-col">
            <div className="ml-auto w-fit">
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
            </div>
            {children}
          </main>

          {/* Right Sidebar - Solo visible en PC */}
          {showRightSidebar && <RightSidebar />}
        </div>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
