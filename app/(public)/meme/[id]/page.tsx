import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SocialMediaPosting, WithContext } from "schema-dts";
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
      title: "Meme Not Found",
      description: "The requested meme could not be found.",
    };
  }

  return {
    title: meme.title || "Untitled Meme",
    description: `Check out this meme by ${meme.user.name}. ${meme.likesCount} likes, ${meme.commentsCount} comments.`,
    openGraph: {
      title: meme.title || "Untitled Meme",
      description: `Check out this meme by ${meme.user.name}.`,
      type: "article",
      authors: [meme.user.name],
      publishedTime: meme.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: meme.title || "Untitled Meme",
      description: `Check out this meme by ${meme.user.name}.`,
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
    headline: meme.title || "Untitled Meme",
    image: [meme.imageUrl],
    datePublished: meme.createdAt.toISOString(),
    author: {
      "@type": "Person",
      name: meme.user.name,
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
