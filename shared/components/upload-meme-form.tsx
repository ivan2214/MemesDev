"use client";

import { useUploadFile } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";
import { CheckIcon, PlusIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { uploadMeme } from "@/shared/actions/meme-actions";
import { uploadOptimizedImage } from "@/shared/actions/upload-actions";

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
type CategoryForm = Omit<
  Category,
  "createdAt" | "updatedAt" | "icon" | "color"
>;

const formSchema = z.object({
  file: z.file().min(1, "Seleccione un archivo"),
  title: z.string().optional(),
  tags: z.array(z.custom<TagForForm>()).nullable(),
  category: z.custom<CategoryForm>().nullable(),
});

export function UploadMemeForm({
  tagsDB,
  categoriesDB,
  onClose,
}: {
  tagsDB: TagForForm[];
  categoriesDB: CategoryForm[];
  onClose: () => void;
}) {
  const [newTag, setNewTag] = useState<TagForForm | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryForm | null>(null);
  const [openCategorySelect, setOpenCategorySelect] = useState(false);

  const form = useForm({
    defaultValues: {
      tags: null as TagForForm[] | null,
      file: [] as never as File,
      title: "",
      category: null as CategoryForm | null,
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
      const formData = new FormData();
      formData.append("file", value.file);
      formData.append("type", "meme");

      let imageKey: string;
      try {
        const { key } = await uploadOptimizedImage(formData);
        imageKey = key;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error al subir el meme");
        }
        return;
      }

      const { success } = await uploadMeme({
        tags: value.tags,
        imageKey: imageKey,
        category: value.category,
        title: value.title,
      });

      if (!success) {
        return toast.error("Error al subir el meme");
      } else {
        toast.success("Meme subido correctamente");
      }

      form.reset();
      onClose();
    },
    onSubmitInvalid() {
      toast.error("Error al actualizar el perfil");
    },
  });

  const uploader = useUploadFile({
    route: "memes",
    onError(error) {
      toast.error(error.message);
    },
  });

  const handleRemoveTag = (id: string) => {
    const selected = form.state.values.tags;
    if (!selected) {
      return;
    }
    form.setFieldValue(
      "tags",
      selected.filter((t) => t.id !== id),
    );
  };

  const handleSelectTag = (id: string, value: string) => {
    const selected = form.state.values.tags;

    if (selected?.some((t) => t.id === id)) {
      handleRemoveTag(id);
      return;
    }

    form.setFieldValue("tags", [
      ...(selected || []),
      { id: id, name: value, slug: value.toLowerCase().replace(" ", "-") },
    ]);
    setNewTag(null);
  };

  const handleCreateTag = () => {
    const selected = form.state.values.tags;

    if (!newTag) {
      return;
    }
    form.setFieldValue("tags", [...(selected || []), newTag]);

    setNewTag(null);
  };

  const handleRemoveCategory = (id: string) => {
    const selected = form.state.values.category;
    if (!selected) {
      return;
    }
    if (selected.id !== id) {
      return;
    }

    form.setFieldValue("category", null);
  };

  const handleSelectCategory = (category: CategoryForm) => {
    const selected = form.state.values.category;

    if (selected?.id === category.id) {
      handleRemoveCategory(category.id);
      return;
    }

    form.setFieldValue("category", {
      id: category.id,
      name: category.name,
      slug: category.name.toLowerCase().replace(" ", "-"),
    });
    setNewCategory(null);
    setOpenCategorySelect(false);
  };

  const handleCreateCategory = () => {
    if (!newCategory) {
      return;
    }
    form.setFieldValue("category", {
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.name.toLowerCase().replace(" ", "-"),
    });

    setNewCategory(null);
  };

  return (
    <form
      id="uploader-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex w-full flex-col items-center justify-center gap-5"
    >
      <FieldGroup className="flex flex-col items-center justify-center text-center">
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
            const category = field.state.value;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-center" htmlFor={field.name}>
                  Categoria
                </FieldLabel>
                <Tags
                  open={openCategorySelect}
                  onOpenChange={setOpenCategorySelect}
                >
                  <TagsTrigger placeholder="Selecciona una categoria">
                    {category?.name && (
                      <TagsValue
                        onRemove={() => handleRemoveCategory(category.id)}
                      >
                        {category.name}
                      </TagsValue>
                    )}
                  </TagsTrigger>
                  <TagsContent>
                    <TagsInput
                      value={newCategory?.name || ""}
                      onValueChange={(value) => {
                        setNewCategory({
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
                          onClick={handleCreateCategory}
                          type="button"
                        >
                          <PlusIcon
                            className="text-muted-foreground"
                            size={14}
                          />
                          Crear categoria: {newCategory?.name || ""}
                        </button>
                      </TagsEmpty>
                      <TagsGroup>
                        {categoriesDB.map((cat) => (
                          <TagsItem
                            key={cat.id}
                            onSelect={() => handleSelectCategory(cat)}
                            value={cat.slug}
                          >
                            {cat.name}
                            {category?.id === cat.id && (
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

        <form.Field name="tags">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const tags = field.state.value?.filter(
              (t) => t.id !== "" && t.name !== "",
            );

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-center" htmlFor={field.name}>
                  Tags
                </FieldLabel>
                <Tags>
                  <TagsTrigger placeholder="Selecciona una etiqueta">
                    {tags?.map((tag) => (
                      <TagsValue
                        key={tag.id}
                        onRemove={() => handleRemoveTag(tag.id)}
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
                          Crear tag: {newTag?.name || ""}
                        </button>
                      </TagsEmpty>
                      <TagsGroup>
                        {tagsDB.map((tag) => (
                          <TagsItem
                            key={tag.id}
                            onSelect={() => handleSelectTag(tag.id, tag.name)}
                            value={tag.id}
                          >
                            {tag.name}
                            {tags?.some((t) => t.id === tag.id) && (
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
                <FieldLabel className="p-0" htmlFor={field.name}>
                  Meme
                </FieldLabel>
                {field.state.value.name ? (
                  <div className="">
                    <div className="relative mx-auto flex w-96 items-center gap-2">
                      <Image
                        src={URL.createObjectURL(field.state.value)}
                        alt={field.state.value.name}
                        width={384}
                        height={216}
                        className="aspect-auto h-full w-full rounded border object-cover"
                      />
                      <Button
                        variant="destructive"
                        type="button"
                        className="absolute -top-5 -right-5 rounded-full"
                        size="icon-xs"
                        onClick={() => {
                          field.handleChange(undefined as never as File);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="mt-4">
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
              onClose();
            }}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="uploader-form"
            disabled={form.state.isSubmitting}
            className="cursor-pointer"
          >
            Subir
          </Button>
        </div>
      </Field>
    </form>
  );
}
