import type React from "react";
import { Suspense } from "react";
import { MainLayout } from "@/shared/components/main-layout";
import { Spinner } from "@/shared/components/ui/spinner";
import { AuthGuard } from "./auth-guard";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AuthGuard>
        <MainLayout showRightSidebar={false}>{children}</MainLayout>
      </AuthGuard>
    </Suspense>
  );
}
