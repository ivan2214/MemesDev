import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SearchPage } from "@/features/search/search";
import { Header } from "@/shared/components/header";
import Loading from "./loading";

function SearchContent() {
  const [searchParams] = useSearchParams();
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
