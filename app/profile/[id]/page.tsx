import type { Metadata } from "next";
import { Header } from "@/shared/components/header";
import { getUserLikedMemes, getUserMemes, getUserProfile } from "./_actions";
import { ProfilePage } from "./_components/profile-page";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params;
  const { user } = await getUserProfile(id);

  if (!user) {
    return {
      title: "Usuario no encontrado | Memes Dev",
      description: "El usuario que buscas no existe en Memes Dev.",
    };
  }

  return {
    title: `${user.name} (@${user.name}) | Memes Dev`,
    description:
      user.bio || `Explora los mejores memes compartidos por ${user.name}.`,
    openGraph: {
      title: `${user.name} - Perfil`,
      description: user.bio || `Mira los memes de ${user.name}`,
      images: user.image ? [{ url: user.image }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name} | Memes Dev`,
      description: user.bio || `Mira los memes de ${user.name}`,
      images: user.image ? [user.image] : [],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { user: profile } = await getUserProfile(id);

  if (!profile) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-muted-foreground">User not found</p>
        </div>
      </>
    );
  }

  const { memes: userMemes } = await getUserMemes(id);
  const { memes: likedMemes } = await getUserLikedMemes(id);

  return (
    <ProfilePage
      profile={profile}
      initialUserMemes={userMemes}
      initialLikedMemes={likedMemes}
      userId={id}
    />
  );
}
