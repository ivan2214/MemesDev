"use client";

import { useUploadFile } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";
import { CheckIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { searchCategories, uploadMeme } from "@/app/upload/actions";
import { AsyncSelect } from "@/shared/components/async-select";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
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
} from "@/shared/components/ui/shadcn-io/tags";
import { UploadDropzone } from "@/shared/components/ui/upload-dropzone";
import type { Category } from "@/types/category";
import type { Tag } from "@/types/tag";

type TagForForm = Omit<Tag, "createdAt" | "updatedAt">;

const defaultTags = [
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "nextjs", name: "Next.js" },
  { id: "vuejs", name: "Vue.js" },
  { id: "angular", name: "Angular" },
  { id: "svelte", name: "Svelte" },
  { id: "nodejs", name: "Node.js" },
  { id: "python", name: "Python" },
  { id: "ruby", name: "Ruby" },
  { id: "java", name: "Java" },
  { id: "csharp", name: "C#" },
  { id: "php", name: "PHP" },
  { id: "go", name: "Go" },
];

const formSchema = z.object({
  tags: z.array(z.custom<TagForForm>()).min(1, "Escriba al menos una etiqueta"),
  file: z.file().min(1, "Seleccione un archivo"),
  title: z.string().min(1, "Escriba un titulo").optional(),
  category: z.string().min(1, "Escriba una categoria").optional(),
});
export function UploadMemeForm() {
  const [newTag, setNewTag] = useState<TagForForm | null>(null);

  const form = useForm({
    defaultValues: {
      tags: [] as TagForForm[],
      file: [] as never as File,
      title: "",
      category: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value);
        if (!result.success) {
          return {
            form: result.error.message,
            fields: result.error.issues,
          };
        }
        return undefined;
      },
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
        tags: value.tags,
        imageKey: file.objectInfo.key,
        category: value.category,
        title: value.title,
      });
    },
    onSubmitInvalid(props) {
      console.log("props:", props);
      const meta = props.meta;
      console.log("meta:", meta);
      const errors = props.formApi.state.errors;
      console.log("errors:", errors);

      toast.error("Error al actualizar el perfil");
    },
  });

  const uploader = useUploadFile({
    route: "memes",
    onError(error) {
      toast.error(error.message);
    },
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

    form.setFieldValue("tags", [
      ...selected,
      { id: id, name: value, slug: value.toLowerCase().replace(" ", "-") },
    ]);
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
                        width={300}
                        height={300}
                        className="aspect-square h-full max-h-[400px] w-full max-w-[400px] rounded border"
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

        <form.Field name="title">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Titulo</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Titulo"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="category">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Categoría</FieldLabel>
                <AsyncSelect<Category>
                  fetcher={searchCategories}
                  renderOption={(category) => (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </div>
                  )}
                  getOptionValue={(category) => category.slug}
                  getDisplayValue={(category) => (
                    <div className="flex items-center gap-2 text-left">
                      <div className="flex flex-col leading-tight">
                        <div className="font-medium">{category.name}</div>
                      </div>
                    </div>
                  )}
                  notFound={
                    <div className="py-6 text-center text-sm">
                      No se encontraron categorías
                    </div>
                  }
                  label="Categoría"
                  placeholder="Selecciona una categoría"
                  value={field.state.value}
                  onChange={field.handleChange}
                  triggerClassName="w-full"
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="tags">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const tags = field.state.value.filter(
              (t) => t.id !== "" && t.name !== "",
            );

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-center" htmlFor={field.name}>
                  Tags
                </FieldLabel>
                <Tags>
                  <TagsTrigger placeholder="Selecciona una etiqueta">
                    {tags.map((tag) => (
                      <TagsValue
                        key={tag.id}
                        onRemove={() => handleRemove(tag.id)}
                      >
                        {tag.name}
                      </TagsValue>
                    ))}
                  </TagsTrigger>
                  <TagsContent>
                    <TagsInput
                      value={newTag?.name || ""}
                      onValueChange={(value) => {
                        setNewTag({
                          id: value,
                          name: value,
                          slug: value.toLowerCase().replace(" ", "-"),
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
                          Create new tag: {newTag?.name || ""}
                        </button>
                      </TagsEmpty>
                      <TagsGroup>
                        {defaultTags.map((tag) => (
                          <TagsItem
                            key={tag.id}
                            onSelect={() => handleSelect(tag.id, tag.name)}
                            value={tag.id}
                          >
                            {tag.name}
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
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="uploader-form"
            disabled={uploader.isPending}
            className="cursor-pointer"
          >
            Subir
          </Button>
        </div>
      </Field>
    </form>
  );
}
