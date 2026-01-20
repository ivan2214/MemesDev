import { getMemes } from "./_actions";
import { HomePage } from "./_components/home-page";

export default async function Page() {
  const { memes } = await getMemes(0, 12);
  return <HomePage initialMemes={memes} />;
}
