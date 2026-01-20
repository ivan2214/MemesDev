import { Suspense } from "react";
import { SearchPage } from "@/features/search/search";

import Loading from "./loading";

function SearchContent() {
  return <SearchPage />;
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchContent />
    </Suspense>
  );
}
