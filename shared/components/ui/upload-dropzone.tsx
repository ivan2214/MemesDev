import type { UploadHookControl } from "@better-upload/client";
import { Loader2, Upload, User } from "lucide-react";
import { useId } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type UploadDropzoneProps<TMultiple extends boolean> = {
  control: UploadHookControl<TMultiple>;
  multiple?: TMultiple;
  id?: string;
  accept?: string;
  metadata?: Record<string, unknown>;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  uploadOverride?: (
    ...args: Parameters<UploadHookControl<TMultiple>["upload"]>
  ) => void;

  // Add any additional props you need.
  isAvatarVariant?: boolean;
};

export function UploadDropzone<TMultiple extends boolean = false>({
  control: { upload, isPending },
  multiple,
  id: _id,
  accept,
  metadata,
  description,
  uploadOverride,
  isAvatarVariant = false,
}: UploadDropzoneProps<TMultiple>) {
  const id = useId();

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: (files) => {
      if (files.length > 0 && !isPending) {
        const options = { metadata };

        if (multiple) {
          // When multiple is true, pass the files array
          if (uploadOverride) {
            (
              uploadOverride as (
                input: File[],
                options?: { metadata?: Record<string, unknown> },
              ) => void
            )(files, options);
          } else {
            (
              upload as unknown as (
                input: File[],
                options?: { metadata?: Record<string, unknown> },
              ) => void
            )(files, options);
          }
        } else {
          // When multiple is false, pass a single file
          const file = files[0];
          if (uploadOverride) {
            (
              uploadOverride as (
                input: File,
                options?: { metadata?: Record<string, unknown> },
              ) => void
            )(file, options);
          } else {
            (
              upload as unknown as (
                input: File,
                options?: { metadata?: Record<string, unknown> },
              ) => void
            )(file, options);
          }
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
    multiple: multiple ?? false,
  });

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div
        className={cn(
          "relative rounded-lg border border-primary border-dashed text-primary transition-colors",
          {
            "border-primary/80": isDragActive,
          },
          isAvatarVariant && "mx-auto h-28 max-h-28 w-28 max-w-28 rounded-full",
          !isAvatarVariant && "w-full",
        )}
      >
        <label
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-6 transition-colors dark:bg-input/10",
            {
              "cursor-not-allowed text-muted-foreground": isPending,
              "hover:bg-accent dark:hover:bg-accent/40": !isPending,
              "opacity-0": isDragActive,
            },
            !isAvatarVariant && "w-full min-w-72",
            isAvatarVariant &&
              "mx-auto h-28 max-h-28 w-28 max-w-28 rounded-full",
          )}
          htmlFor={_id || id}
        >
          <div className="my-2">
            {isPending ? (
              <Loader2 className="size-6 animate-spin" />
            ) : !isAvatarVariant ? (
              <Upload className="size-6" />
            ) : (
              <User className="size-6" />
            )}
          </div>

          {!isAvatarVariant && (
            <div className="mt-3 space-y-1 text-center">
              <p className="font-semibold text-sm">
                Arrastre o suelte para subir
              </p>

              <p className="max-w-64 text-muted-foreground text-xs">
                {typeof description === "string" ? (
                  description
                ) : (
                  <>
                    {description?.maxFiles &&
                      `Puedes subir ${description.maxFiles} archivo${description.maxFiles !== 1 ? "s" : ""}.`}{" "}
                    {description?.maxFileSize &&
                      `${description.maxFiles !== 1 ? "Cada uno" : "Un"} archivo pesa hasta ${description.maxFileSize}.`}{" "}
                    {description?.fileTypes &&
                      `Aceptados ${description.fileTypes}.`}
                  </>
                )}
              </p>
            </div>
          )}

          <input
            {...getInputProps()}
            type="file"
            multiple={multiple}
            id={_id || id}
            accept={accept}
            disabled={isPending}
          />
        </label>

        {isDragActive && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 rounded-lg",
              isAvatarVariant &&
                "mx-auto h-28 max-h-28 w-28 max-w-28 rounded-full",
            )}
          >
            <div
              className={cn(
                "flex size-full flex-col items-center justify-center rounded-lg bg-accent dark:bg-accent/40",
                isAvatarVariant &&
                  "mx-auto h-28 max-h-28 w-28 max-w-28 rounded-full",
              )}
            >
              <div className="my-2">
                {isAvatarVariant ? (
                  <User className="size-6" />
                ) : (
                  <Upload className="size-6" />
                )}
              </div>

              {!isAvatarVariant && (
                <p className="mt-3 font-semibold text-sm">Drop files here</p>
              )}
              {isAvatarVariant && (
                <p className="mt-3 text-center font-semibold text-xs">
                  Drop your avatar here
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      {isAvatarVariant && (
        <div className="mt-3 space-y-1 text-center">
          <p className="font-semibold text-sm">Drag and drop files here</p>

          <p className="max-w-64 text-muted-foreground text-xs">
            {typeof description === "string" ? (
              description
            ) : (
              <>
                {description?.maxFiles &&
                  `You can upload ${description.maxFiles} file${description.maxFiles !== 1 ? "s" : ""}.`}{" "}
                {description?.maxFileSize &&
                  `${description.maxFiles !== 1 ? "Each u" : "U"}p to ${description.maxFileSize}.`}{" "}
                {description?.fileTypes && `Accepted ${description.fileTypes}.`}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
