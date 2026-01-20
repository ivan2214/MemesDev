import { redirect } from "next/navigation";
import { getAllTags } from "@/app/search/_actions";
import { getUserSettings } from "./_actions";
import { ProfileForm } from "./_components/profile-form";

export default async function SettingsProfilePage() {
  const user = await getUserSettings();
  const { tags } = await getAllTags();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-bold text-3xl">Editar Perfil</h1>
        <p className="text-muted-foreground">
          Actualiza tu información personal, avatar y redes sociales.
        </p>
      </div>
      <ProfileForm initialData={user} allTags={tags} />
    </div>
  );
}
