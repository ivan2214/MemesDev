import { HomePage } from "@/features/home/home";

import { getMemes } from "./actions";

export default async function Page() {
  const { memes } = await getMemes(0, 12);
  return <HomePage initialMemes={memes} />;
}
