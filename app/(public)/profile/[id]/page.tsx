import type { Metadata } from "next";
import type { ProfilePage as SchemaProfilePage, WithContext } from "schema-dts";
import { env } from "@/env/server";
import { Header } from "@/shared/components/header";
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
      title: "Usuario no encontrado | DevMemes",
      description: "El usuario que buscas no existe en DevMemes.",
    };
  }

  const title = `${user.name} (@${user.name}) | Perfil de DevMemes`;
  const description =
    user.bio ||
    `Mira el perfil de ${user.name} en DevMemes. Explora sus memes publicados y contribuciones a la comunidad.`;

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
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-muted-foreground">Usuario no encontrado</p>
        </div>
      </>
    );
  }

  const { memes: userMemes } = await getUserMemes(id);

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

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <Used for JSON-LD>
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProfilePage profile={profile} initialUserMemes={userMemes} userId={id} />
    </>
  );
}
