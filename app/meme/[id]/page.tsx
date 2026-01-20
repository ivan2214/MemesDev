import { notFound } from "next/navigation";
import { getComments, getMeme } from "@/actions/meme";
import { MemeDetail } from "@/features/meme-detail/meme-detail";
import { Header } from "@/shared/components/header";

export default async function MemePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const meme = await getMeme(id);
  const comments = await getComments(id);

  if (!meme) {
    notFound();
  }

  return (
    <>
      <Header />
      <MemeDetail memeId={id} initialMeme={meme} initialComments={comments} />
    </>
  );
}
