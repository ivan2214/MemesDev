import { UploadIcon } from "lucide-react";
import type React from "react";
import { getAllTags } from "@/app/(public)/search/_actions";
import { getCurrentUser } from "@/data/user";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { getAllCategories } from "../actions/category-actions";
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

export async function MainLayout({
  children,
  showRightSidebar,
}: MainLayoutProps) {
  const categories = await getAllCategories();
  const { tags } = await getAllTags();
  const user = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar categories={categories} browseTags={tags} />
      <SidebarInset>
        <Header categoriesDB={categories} tagsDB={tags} />
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
                <UploadDialog categoriesDB={categories} tagsDB={tags}>
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
