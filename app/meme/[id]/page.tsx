import { MemeDetail } from "@/features/meme-detail/meme-detail";
import { Header } from "@/shared/components/header";

export default async function MemePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <>
      <Header />
      <MemeDetail memeId={id} />
    </>
  );
}
