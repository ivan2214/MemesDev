import { ProfilePage } from "@/features/profile/profile";
import { Header } from "@/shared/components/header";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <>
      <Header />
      <ProfilePage userId={id} />
    </>
  );
}
