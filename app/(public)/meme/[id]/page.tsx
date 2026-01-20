import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SocialMediaPosting, WithContext } from "schema-dts";
import { env } from "@/env/server";
import { getComments } from "@/shared/actions/meme-actions";
import { getMeme } from "./_actions";
import { MemeDetail } from "./_components/meme-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meme = await getMeme(id);

  if (!meme) {
    return {
      title: "Meme no encontrado | MemesDev",
      description: "El meme que buscas no existe o ha sido eliminado.",
    };
  }

  const title = meme.title || "Meme de programación";
  const limit = 150;
  const description =
    meme.title && meme.title.length > 20
      ? `Mira este meme de programación: "${meme.title}" por ${meme.user.name}. ${meme.likesCount} me gusta.`
      : `Mira este meme de programación subido por ${meme.user.name}. ${meme.likesCount} me gusta y ${meme.commentsCount} comentarios.`;

  return {
    title: `${title} | MemesDev`,
    description: description.substring(0, limit),
    openGraph: {
      title: `${title} | MemesDev`,
      description: description.substring(0, limit),
      type: "article",
      url: `${env.APP_URL}/meme/${meme.id}`,
      authors: [meme.user.name],
      publishedTime: meme.createdAt.toISOString(),
      images: [
        {
          url: meme.imageUrl,
          width: 800,
          height: 600,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MemesDev`,
      description: description.substring(0, limit),
      images: [meme.imageUrl],
      creator: "@MemesDev", // Asumiendo un handle genérico o del usuario si existiera
    },
    alternates: {
      canonical: `${env.APP_URL}/meme/${meme.id}`,
    },
  };
}

export default async function MemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const meme = await getMeme(id);
  const { comments } = await getComments(id);

  if (!meme) {
    notFound();
  }

  const jsonLd: WithContext<SocialMediaPosting> = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: meme.title || "Meme de programación",
    image: [meme.imageUrl],
    datePublished: meme.createdAt.toISOString(),
    author: {
      "@type": "Person",
      name: meme.user.name,
      url: `${env.APP_URL}/profile/${meme.user.id}`,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "LikeAction" },
        userInteractionCount: meme.likesCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: { "@type": "CommentAction" },
        userInteractionCount: meme.commentsCount,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "MemesDev",
      url: env.APP_URL,
    },
    identifier: meme.id,
    url: `${env.APP_URL}/meme/${meme.id}`,
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
      <MemeDetail memeId={id} meme={meme} comments={comments} />
    </>
  );
}
