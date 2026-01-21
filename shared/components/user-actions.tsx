import { UploadIcon } from "lucide-react";
import { getCurrentUser } from "@/data/user";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";
import { AuthDialog } from "./auth-dialog";
import { Button } from "./ui/button";
import { UploadDialog } from "./upload-dialog";

interface UserActionsProps {
  categories: Category[];
  tags: Tag[];
}

export async function UserActions({ categories, tags }: UserActionsProps) {
  const user = await getCurrentUser();

  if (user) {
    return (
      <UploadDialog categoriesDB={categories} tagsDB={tags}>
        <Button size="sm">
          <UploadIcon className="mr-2 h-4 w-4" />
          Subir meme
        </Button>
      </UploadDialog>
    );
  }

  return (
    <AuthDialog>
      <Button size="sm">
        <UploadIcon className="mr-2 h-4 w-4" />
        Subir meme
      </Button>
    </AuthDialog>
  );
}
