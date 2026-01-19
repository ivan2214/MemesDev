import { Suspense } from "react";
import { SearchPage } from "@/features/search/search";
import { Header } from "@/shared/components/header";
import Loading from "./loading";

function SearchContent() {
  return <SearchPage />;
}

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<Loading />}>
        <SearchContent />
      </Suspense>
    </>
  );
}
