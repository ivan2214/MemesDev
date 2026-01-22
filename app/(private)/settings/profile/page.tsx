import { Suspense } from "react";
import { getAllCategories, getAllTags } from "@/server/dal/categories";
import { getUserSettingsDal } from "@/server/dal/users";
import { Spinner } from "@/shared/components/ui/spinner";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { ProfileForm } from "./_components/profile-form";

async function SettingsFetcher({
  tags,
  categories,
}: {
  tags: Tag[];
  categories: Category[];
}) {
  const user = await getUserSettingsDal();

  return (
    <ProfileForm currentUser={user} tagsDB={tags} categoriesDB={categories} />
  );
}

export default async function SettingsProfilePage() {
  const tags = await getAllTags();
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Editar Perfil</h1>
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
        <SettingsFetcher tags={tags} categories={categories} />
      </Suspense>
    </div>
  );
}
