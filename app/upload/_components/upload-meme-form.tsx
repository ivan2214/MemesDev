"use client";

import { useUploadFile } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";
import { CheckIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { uploadMeme } from "@/app/upload/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/shadcn-io/tags";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

const defaultTags = [
  { id: "react", label: "React" },
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "nextjs", label: "Next.js" },
  { id: "vuejs", label: "Vue.js" },
  { id: "angular", label: "Angular" },
  { id: "svelte", label: "Svelte" },
  { id: "nodejs", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "ruby", label: "Ruby" },
  { id: "java", label: "Java" },
  { id: "csharp", label: "C#" },
  { id: "php", label: "PHP" },
  { id: "go", label: "Go" },
];

const formSchema = z.object({
  tags: z
    .array(z.object({ id: z.string(), label: z.string() }))
    .min(1, "Escriba al menos una etiqueta"),
  file: z.file().min(1, "Seleccione un archivo"),
});
export function UploadMemeForm() {
  const [newTag, setNewTag] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const form = useForm({
    defaultValues: {
      tags: [
        {
          id: "",
          label: "",
        },
      ],
      file: [] as never as File,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.file) {
        return toast.error("No se selecciono un archivo");
      }
      const { file } = await uploader.upload(value.file);

      console.log({
        tags: value.tags,
        objectKeys: file.objectInfo.key,
      });

      await uploadMeme({
        tags: value.tags.map((t) => t.label),
        imageKey: file.objectInfo.key,
      });
    },
  });

  const uploader = useUploadFile({
    route: "memes",
  });

  const handleRemove = (id: string) => {
    const selected = form.state.values.tags;
    if (!selected.some((t) => t.id === id)) {
      return;
    }

    form.setFieldValue(
      "tags",
      selected.filter((t) => t.id !== id),
    );
  };

  const handleSelect = (id: string, value: string) => {
    const selected = form.state.values.tags;
    if (selected.some((t) => t.id === id)) {
      handleRemove(id);
      return;
    }

    form.setFieldValue("tags", [...selected, { id: id, label: value }]);
    setNewTag(null);
  };

  const handleCreateTag = () => {
    if (!newTag) {
      return;
    }
    form.setFieldValue("tags", [...form.state.values.tags, newTag]);

    setNewTag(null);
  };

  return (
    <form
      id="uploader-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col items-center justify-center gap-5"
    >
      <FieldGroup className="flex flex-col items-center justify-center text-center">
        <form.Field name="tags">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const tags = field.state.value.filter(
              (t) => t.id !== "" && t.label !== "",
            );

            return (
              <Field
                className="flex flex-col items-center justify-center"
                data-invalid={isInvalid}
              >
                <FieldLabel className="text-center" htmlFor={field.name}>
                  Tags
                </FieldLabel>
                <Tags className="max-w-[300px]">
                  <TagsTrigger placeholder="Selecciona una etiqueta">
                    {tags.map((tag) => (
                      <TagsValue
                        key={tag.id}
                        onRemove={() => handleRemove(tag.id)}
                      >
                        {tag.label}
                      </TagsValue>
                    ))}
                  </TagsTrigger>
                  <TagsContent>
                    <TagsInput
                      value={newTag?.label || ""}
                      onValueChange={(value) => {
                        setNewTag({
                          id: value,
                          label: value,
                        });
                      }}
                      placeholder="Buscar..."
                    />
                    <TagsList>
                      <TagsEmpty>
                        <button
                          className="mx-auto flex cursor-pointer items-center gap-2"
                          onClick={handleCreateTag}
                          type="button"
                        >
                          <PlusIcon
                            className="text-muted-foreground"
                            size={14}
                          />
                          Create new tag: {newTag?.label || ""}
                        </button>
                      </TagsEmpty>
                      <TagsGroup>
                        {defaultTags.map((tag) => (
                          <TagsItem
                            key={tag.id}
                            onSelect={() => handleSelect(tag.id, tag.label)}
                            value={tag.id}
                          >
                            {tag.label}
                            {tags.some((t) => t.id === tag.id) && (
                              <CheckIcon
                                className="text-muted-foreground"
                                size={14}
                              />
                            )}
                          </TagsItem>
                        ))}
                      </TagsGroup>
                    </TagsList>
                  </TagsContent>
                </Tags>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
        <form.Field name="file">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              uploader.isError;
            const name = field.state.value.name;
            const extension = name?.split(".").pop();
            const fileName = `${name?.slice(0, 10)}.${extension}`;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Meme</FieldLabel>
                {field.state.value.name ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative flex items-center gap-2">
                      <Image
                        src={URL.createObjectURL(field.state.value)}
                        alt={field.state.value.name}
                        width={100}
                        height={100}
                        className="aspect-square h-full max-h-[300px] w-full max-w-[300px] rounded-md border"
                      />
                      <Button
                        variant="destructive"
                        type="button"
                        className="absolute -top-5 -right-5 h-6 w-6"
                        onClick={() => {
                          field.handleChange(undefined as never as File);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {fileName}
                    </Badge>
                  </div>
                ) : (
                  <UploadDropzone
                    id={field.name}
                    control={uploader.control}
                    accept="image/*"
                    description={{
                      maxFiles: 1,
                      maxFileSize: "5MB",
                    }}
                    uploadOverride={(file) => {
                      field.handleChange(file);
                    }}
                    isAvatarVariant={false}
                    multiple={false}
                  />
                )}
                {isInvalid && (
                  <FieldError
                    errors={
                      uploader.error
                        ? [{ message: uploader.error.message }]
                        : field.state.meta.errors
                    }
                  />
                )}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>
      <Field orientation="horizontal" className="ml-auto w-fit">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              uploader.reset();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="uploader-form"
            disabled={uploader.isPending}
          >
            Subir
          </Button>
        </div>
      </Field>
    </form>
  );
}
