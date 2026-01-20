import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { UploadMemeForm } from "@/shared/components/upload-meme-form";

interface UploadDialogProps {
  children?: React.ReactElement;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ children }) => {
  return (
    <Dialog>
      {children && <DialogTrigger render={children} />}
      <DialogContent>
        <UploadMemeForm />
      </DialogContent>
    </Dialog>
  );
};
