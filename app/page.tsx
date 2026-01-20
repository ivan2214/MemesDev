import type { Metadata } from "next";
import type { SearchAction, WebSite, WithContext } from "schema-dts";
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

  const jsonLd: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DevMemes",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com"
        }/search?q={search_term_string}`,
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
      <HomePage initialMemes={memes} />
    </>
  );
}
