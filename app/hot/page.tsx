import { getHotMemes } from "./_actions";
import { HotPage } from "./_components/hot-page";

export default async function Page() {
  const { memes } = await getHotMemes({ offset: 0, limit: 12, sort: "hot" });
  return <HotPage initialMemes={memes} />;
}
