import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import type { SocialMediaPosting, WithContext } from "schema-dts";
import { env } from "@/env/server";
import { auth } from "@/lib/auth";
import { getUserLikeds } from "@/server/dal/likes";
import { getMeme as getMemeDal } from "@/server/dal/memes";
import { getComments } from "@/shared/actions/meme-actions";

import type { Meme } from "@/types/meme";
import { MemeDetail } from "./_components/meme-detail";

async function MemeVerifier({ meme, memeId }: { meme: Meme; memeId: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { comments } = await getComments(memeId);
  let isLiked = false;

  if (session?.user?.id) {
    const likes = await getUserLikeds(session.user.id, [memeId]);
    isLiked = likes.length > 0;
  }

  const fullMeme = { ...meme, isLiked };
  return <MemeDetail memeId={memeId} meme={fullMeme} comments={comments} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const memeData = await getMemeDal(id);

  if (!memeData) {
    return {
      title: "Meme no encontrado | MemesDev",
      description: "El meme que buscas no existe o ha sido eliminado.",
    };
  }

  const meme: Meme = {
    ...memeData,
    tags: memeData.tags.map((t) => t.tag),
  };

  const title = meme.title || "Meme de programación";
  const limit = 150;
  const description =
    meme.title && meme.title.length > 20
      ? `Mira este meme de programación: "${meme.title}" por ${meme.user.name}. ${meme.likesCount} me gusta.`
      : `Mira este meme de programación subido por ${meme.user.name}. ${meme.likesCount} me gusta y ${meme.commentsCount} comentarios.`;

  console.log(meme.imageUrl);

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

          alt: meme.title || "Meme",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MemesDev`,
      description: description.substring(0, limit),
      creator: "@ivan2214", // Asumiendo un handle genérico o del usuario si existiera
      images: [
        {
          url: meme.imageUrl,

          alt: meme.title || "Meme",
        },
      ],
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

  const memeData = await getMemeDal(id);
  // getComments removed from here to avoid uncached data access

  if (!memeData) {
    notFound();
  }

  const meme: Meme = {
    ...memeData,
    tags: memeData.tags.map((t) => t.tag),
  };

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

      <MemeVerifier meme={meme} memeId={id} />
    </>
  );
}
