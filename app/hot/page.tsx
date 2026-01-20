import type { TimeRange } from "./_actions";
import { getHotMemes } from "./_actions";
import { HotPage } from "./_components/hot-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const params = await searchParams;
  const timeRange = (params.t as TimeRange) || "24h";

  const { memes } = await getHotMemes({
    offset: 0,
    limit: 12,
    sort: "hot",
    timeRange,
  });

  return <HotPage initialMemes={memes} initialTimeRange={timeRange} />;
}
