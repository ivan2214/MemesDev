import { Suspense } from "react";
import { getAllTags } from "./_actions";
import { SearchPage } from "./_components/search-page";
import Loading from "./loading";

async function SearchContent() {
  const { tags } = await getAllTags();
  return <SearchPage initialTags={tags} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}
