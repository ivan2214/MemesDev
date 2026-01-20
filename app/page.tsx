import type { Metadata } from "next";
import { getMemes } from "./_actions";
import { HomePage } from "./_components/home-page";

export const metadata: Metadata = {
  title: "DevMemes - The Best Programming Memes",
  alternates: {
    canonical: "/",
  },
};

export default async function Page() {
  const { memes } = await getMemes(0, 12);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DevMemes",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com"}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePage initialMemes={memes} />
    </>
  );
}
