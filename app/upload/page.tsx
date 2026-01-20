import { UploadMeme } from "@/features/upload/upload";
import { Header } from "@/shared/components/header";

export default function UploadPage() {
  return (
    <>
      <Header />
      <section className="container mx-auto h-full w-full px-4 py-8">
        <UploadMeme />
      </section>
    </>
  );
}
