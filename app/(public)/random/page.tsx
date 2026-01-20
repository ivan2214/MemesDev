export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { env } from "@/env/server";
import { getRandomMemes } from "./_actions";
import { RandomPage } from "./_components/random-page";

export const metadata: Metadata = {
  title: "Memes Aleatorios | MemesDev",
  description:
    "Disfruta de una selección aleatoria de los mejores memes de programación. ¡Sorpréndete con cada recarga!",
  openGraph: {
    title: "Memes Aleatorios | MemesDev",
    description:
      "Disfruta de una selección aleatoria de los mejores memes de programación.",
    url: `${env.APP_URL}/random`,
    type: "website",
  },
  alternates: {
    canonical: `${env.APP_URL}/random`,
  },
};

export default async function Page() {
  const { memes } = await getRandomMemes(8);
  return <RandomPage initialMemes={memes} />;
}
