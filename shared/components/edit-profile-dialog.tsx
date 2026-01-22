import { ProfileForm } from "@/app/(private)/settings/profile/_components/profile-form";
import type { User as CurrentUser } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type { CategoryForm, TagForForm } from "@/shared/types";

export const EditProfileDialog = ({
  categoriesDB,
  currentUser,
  tagsDB,
}: {
  currentUser?: CurrentUser;
  tagsDB: TagForForm[];
  categoriesDB: CategoryForm[];
}) => {
  return (
    <Dialog>
      <DialogTrigger>Edit Profile</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <ProfileForm
          currentUser={currentUser}
          categoriesDB={categoriesDB}
          tagsDB={tagsDB}
        />
      </DialogContent>
    </Dialog>
  );
};
