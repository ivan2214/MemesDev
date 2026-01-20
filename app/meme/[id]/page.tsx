import { notFound } from "next/navigation";
import { getComments } from "@/shared/actions/meme-actions";
import { getMeme } from "./_actions";
import { MemeDetail } from "./_components/meme-detail";

export default async function MemePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const meme = await getMeme(id);
  const { comments } = await getComments(id);

  if (!meme) {
    notFound();
  }

  return <MemeDetail memeId={id} meme={meme} comments={comments} />;
}
