import type React from "react";
import { requireUser } from "@/data/user";

import { MainLayout } from "@/shared/components/main-layout";

interface PrivateLayoutProps {
  children: React.ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  await requireUser();

  return <MainLayout showRightSidebar={false}>{children}</MainLayout>;
}
