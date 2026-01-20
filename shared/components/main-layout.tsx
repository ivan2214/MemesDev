import type React from "react";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { RightSidebar } from "./right-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex justify-center gap-8 px-4 py-6 pb-20 md:pb-6">
          {/* Main Content Column */}
          <main className="w-full max-w-2xl">{children}</main>

          {/* Right Sidebar - Solo visible en PC */}
          <RightSidebar />
        </div>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  );
}
