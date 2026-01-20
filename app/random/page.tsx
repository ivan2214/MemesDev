import { getRandomMemes } from "./_actions";
import { RandomPage } from "./_components/random-page";

export default async function Page() {
  const { memes } = await getRandomMemes(8);
  return <RandomPage initialMemes={memes} />;
}
