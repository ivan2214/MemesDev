"use client";

import { useUploadFiles } from "@better-upload/client";
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone";

export function Uploader() {
  const { control } = useUploadFiles({
    route: "memes",
  });

  return (
    <UploadDropzoneProgress
      control={control}
      accept="image/*"
      description={{
        maxFiles: 1,
        maxFileSize: "2MB",
        fileTypes: "JPEG, PNG, GIF, WEBP",
      }}
    />
  );
}
