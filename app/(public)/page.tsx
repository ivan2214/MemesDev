import type { Metadata } from "next";
import type { SearchAction, WebSite, WithContext } from "schema-dts";
import { env } from "@/env/server";
import { getMemes } from "./_actions";
import { HomePage } from "./_components/home-page";

async function HomeMemesVerifier() {
  const { memes } = await getMemes(0, 12, false);
  return <HomePage initialMemes={memes} />;
}

export const metadata: Metadata = {
  title: "MemesDev - La mejor página de memes para programadores",
  description:
    "Memes de React, JavaScript, Node.js, Python y más. Comparte tus memes favoritos y descubre los de otros programadores.",
  alternates: {
    canonical: env.APP_URL,
  },
  authors: {
    name: "Ivan2214",
    url: "https://github.com/Ivan2214",
  },
};

export default async function Page() {
  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MemesDev",
    url: env.APP_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${env.APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    } as SearchAction & { "query-input": string },
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

      <HomeMemesVerifier />
    </>
  );
}
