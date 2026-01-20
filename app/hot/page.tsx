import { HotPage } from "@/features/hot/hot";
import { getHotMemes } from "./actions";

export default async function Page() {
  const { memes } = await getHotMemes({ offset: 0, limit: 12 });
  return <HotPage initialMemes={memes} />;
}
