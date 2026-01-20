import {
  getUserLikedMemes,
  getUserMemes,
  getUserProfile,
} from "@/features/profile/actions";
import { ProfilePage } from "@/features/profile/profile";
import { Header } from "@/shared/components/header";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const { user: profile } = await getUserProfile(id);

  if (!profile) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-muted-foreground">User not found</p>
        </div>
      </>
    );
  }

  const { memes: userMemes } = await getUserMemes(id);
  const { memes: likedMemes } = await getUserLikedMemes(id);

  return (
    <>
      <Header />
      <ProfilePage
        profile={profile}
        userMemes={userMemes}
        likedMemes={likedMemes}
      />
    </>
  );
}
