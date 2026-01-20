"use client";
import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { UploadMemeForm } from "@/shared/components/upload-meme-form";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

interface UploadDialogProps {
  children?: React.ReactElement;
  categoriesDB: Category[];
  tagsDB: Tag[];
}

export const UploadDialog: React.FC<UploadDialogProps> = ({
  children,
  categoriesDB,
  tagsDB,
}) => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger render={children} />}
      <DialogContent className="max-h-[calc(100vh-2rem)] w-full overflow-y-auto md:max-w-xl">
        <UploadMemeForm
          categoriesDB={categoriesDB}
          tagsDB={tagsDB}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
