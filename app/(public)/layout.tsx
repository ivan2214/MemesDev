import { MainLayout } from "@/shared/components/main-layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout showRightSidebar={true}>{children}</MainLayout>;
}
