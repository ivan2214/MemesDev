import type { Metadata } from "next";
import type { ProfilePage as SchemaProfilePage, WithContext } from "schema-dts";
import { getCurrentUser } from "@/data/user";
import { env } from "@/env/server";
import { getAllCategories, getPopularTags } from "@/server/dal/categories";
import { getUserMemes, getUserProfile } from "./_actions";
import { ProfilePage } from "./_components/profile-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { user } = await getUserProfile(id);

  if (!user) {
    return {
      title: "Usuario no encontrado | MemesDev",
      description: "El usuario que buscas no existe en MemesDev.",
    };
  }

  const title = `${user.name} (@${user.name}) | Perfil de MemesDev`;
  const description =
    user.bio ||
    `Mira el perfil de ${user.name} en MemesDev. Explora sus memes publicados y contribuciones a la comunidad.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.image ? [{ url: user.image }] : [],
      type: "profile",
      url: `${env.APP_URL}/profile/${user.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: user.image ? [user.image] : [],
    },
    alternates: {
      canonical: `${env.APP_URL}/profile/${user.id}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user: profile } = await getUserProfile(id);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Usuario no encontrado</p>
      </div>
    );
  }

  // Single fetch with auth enabled to check likes and get all data needed
  const currentUser = await getCurrentUser();

  const { memes: userMemes } = await getUserMemes(id, 0, 12, currentUser?.id);

  const jsonLd: WithContext<SchemaProfilePage> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: profile.name,
    description: profile.bio || `Perfil de ${profile.name}`,
    url: `${env.APP_URL}/profile/${profile.id}`,
    mainEntity: {
      "@type": "Person",
      name: profile.name,
      image: profile.image || undefined,
      description: profile.bio || undefined,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: { "@type": "WriteAction" },
          userInteractionCount: userMemes.length, // Número de memes publicados
        },
      ],
    },
  };

  const [categoriesDB, tagsDB] = await Promise.all([
    getAllCategories(),
    getPopularTags(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <Used for JSON-LD>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ProfilePage
        profile={profile}
        initialUserMemes={userMemes}
        categoriesDB={categoriesDB}
        tagsDB={tagsDB}
        currentUser={currentUser}
      />
    </>
  );
}
