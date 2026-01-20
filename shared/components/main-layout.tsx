import type React from "react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="min-h-[calc(100vh-4rem)] pb-20 lg:ml-64 lg:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
      </main>
    </>
  );
}
