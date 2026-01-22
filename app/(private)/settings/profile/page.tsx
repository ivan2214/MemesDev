import { Suspense } from "react";
import { getCurrentUser } from "@/data/user";
import type { User } from "@/lib/auth";
import { getAllCategories, getPopularTags } from "@/server/dal/categories";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { ProfileForm } from "./_components/profile-form";

async function SettingsFetcher({
  tags,
  categories,
  currentUser,
}: {
  tags: Tag[];
  categories: Category[];
  currentUser?: User;
}) {
  return (
    <ProfileForm
      currentUser={currentUser}
      tagsDB={tags}
      categoriesDB={categories}
    />
  );
}

export default async function SettingsProfilePage() {
  const tags = await getPopularTags();
  const categories = await getAllCategories();
  const currentUser = await getCurrentUser();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-bold text-2xl">Editar Perfil</h1>
        <p className="text-muted-foreground">
          Actualiza tu información personal, avatar y redes sociales.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        }
      >
        <SettingsFetcher
          tags={tags}
          categories={categories}
          currentUser={currentUser}
        />
      </Suspense>
    </div>
  );
}
