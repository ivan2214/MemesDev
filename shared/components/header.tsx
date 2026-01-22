import { GithubIcon, LogInIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/data/user";
import { getAllCategories, getPopularTags } from "@/server/dal/categories";
import { AuthDialog } from "@/shared/components/auth-dialog";
import { Button } from "@/shared/components/ui/button";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Notifications } from "./notifications";
import { Skeleton } from "./ui/skeleton";
import { UploadDialog } from "./upload-dialog";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 border-b bg-background/45 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="hidden md:flex" />
          <Link
            href="/"
            className="flex items-center gap-2 font-bold font-mono text-2xl md:hidden"
          >
            <Image src="/logo.png" alt="Logo" width={24} height={24} />
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              MemesDev
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost">
            <Link target="_blank" href="https://github.com/ivan2214/MemesDev">
              <GithubIcon className="h-4 w-4" />
            </Link>
          </Button>

          <Suspense
            fallback={
              <section className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                {/* notifications skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                </div>
              </section>
            }
          >
            <HeaderUser />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

const HeaderUser = async () => {
  const user = await getCurrentUser();

  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <>
        <AuthDialog>
          <Button size="sm">
            <UploadIcon className="mr-2 h-4 w-4" />
            Subir meme
          </Button>
        </AuthDialog>
        <AuthDialog>
          <Button size="sm">
            <LogInIcon className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
        </AuthDialog>
      </>
    );
  }

  const [categoriesDB, tagsDB] = await Promise.all([
    getAllCategories(),
    getPopularTags(),
  ]);

  return (
    <>
      <UploadDialog categoriesDB={categoriesDB} tagsDB={tagsDB}>
        <Button size="sm">
          <UploadIcon className="mr-2 h-4 w-4" />
          Subir meme
        </Button>
      </UploadDialog>
      <Notifications />
      <UserMenu user={user} />
    </>
  );
};
