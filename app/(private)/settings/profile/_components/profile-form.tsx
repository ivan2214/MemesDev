"use client";

import { useUploadFile } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";

import { CheckIcon, PlusIcon, TrashIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { updateProfile } from "@/app/(private)/settings/profile/_actions";
import {
  type ProfileSchema,
  profileSchema,
} from "@/app/(private)/settings/profile/_validators";
import type { User as CurrentUser } from "@/lib/auth";
import { uploadOptimizedImage } from "@/shared/actions/upload-actions";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { UploadDropzone } from "@/shared/components/ui/upload-dropzone";
import type { CategoryForm, TagForForm } from "@/shared/types";

interface ProfileFormProps {
  currentUser?: CurrentUser;
  tagsDB: TagForForm[];
  categoriesDB: CategoryForm[];
}

const profileFormSchema = profileSchema.extend({
  imageFile: z.file().optional(),
  imagePreview: z.string().optional(),
});

export function ProfileForm({
  currentUser,
  tagsDB,
  categoriesDB,
}: ProfileFormProps) {
  const [newTag, setNewTag] = useState<TagForForm | null>(null);
  const [newCategory, setNewCategory] = useState<CategoryForm | null>(null);
  const [openCategorySelect, setOpenCategorySelect] = useState(false);

  const form = useForm({
    defaultValues: {
      name: currentUser?.name || "",
      bio: currentUser?.bio || "",
      tags: currentUser?.tags || (null as TagForForm[] | null),
      category: currentUser?.category || (null as CategoryForm | null),
      socials: currentUser?.socials || [],
      imageKey: currentUser?.imageKey || "",
      imageFile: undefined as never as File,
      imagePreview: currentUser?.image || "",
    },

    validators: {
      onSubmit: ({ value }) => {
        const result = profileFormSchema.safeParse(value);
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
      const data = {
        ...value,
      };
      if (value.imageFile) {
        const formData = new FormData();
        formData.append("file", value.imageFile);
        formData.append("type", "avatar");

        try {
          const { key } = await uploadOptimizedImage(formData);
          data.imageKey = key;
        } catch (error) {
          console.error(error);
          toast.error("Error al subir la imagen optimized");
          return;
        }
      }

      try {
        await updateProfile(data as ProfileSchema);
        toast.success("Perfil actualizado correctamente");
      } catch (error) {
        console.error(error);
        toast.error("Error al actualizar el perfil");
      }
    },
    onSubmitInvalid() {
      toast.error("Error al actualizar el perfil");
    },
  });

  const uploader = useUploadFile({
    route: "avatar",
    onError(error) {
      console.error(error);
      toast.error("Error al subir la imagen");
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
    if (!selected) {
      return;
    }
    if (!newTag) {
      return;
    }
    form.setFieldValue("tags", [...selected, newTag]);

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
      id="profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-8"
    >
      {/* Avatar Section */}
      <FieldGroup>
        <form.Field name="imageFile">
          {(field) => {
            const file = field.state.value;
            return (
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <div className="flex flex-col gap-4">
                  {file || form.state.values.imagePreview ? (
                    <div className="relative h-32 w-32">
                      {/* Try to display image. Use a placeholder logic if needed */}
                      <Image
                        src={
                          file
                            ? URL.createObjectURL(file)
                            : form.state.values.imagePreview || ""
                        }
                        alt="Avatar"
                        className="h-full w-full rounded-full border object-cover"
                        width={128}
                        height={128}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          field.handleChange(undefined as never as File);
                          form.setFieldValue("imagePreview", "");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="max-w-xs">
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
                        isAvatarVariant={true}
                        multiple={false}
                      />
                    </div>
                  )}
                </div>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
        </form.Field>

        <form.Field name="bio">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Biografía</FieldLabel>
              <Textarea
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={4}
              />
              {field.state.meta.errors && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          )}
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

        {/* Socials - Dynamic Array */}
        {/* Socials - Dynamic Array */}
        <form.Field name="socials">
          {(field) => (
            <Field>
              <FieldLabel>Redes Sociales</FieldLabel>
              <div className="space-y-2">
                {field.state.value.map((social, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Plataforma (Ej. Twitter)"
                      value={social.platform}
                      onChange={(e) => {
                        const newSocials = [...field.state.value];
                        newSocials[index] = {
                          ...newSocials[index],
                          platform: e.target.value,
                        };
                        field.handleChange(newSocials);
                      }}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="URL"
                      value={social.url}
                      onChange={(e) => {
                        const newSocials = [...field.state.value];
                        newSocials[index] = {
                          ...newSocials[index],
                          url: e.target.value,
                        };
                        field.handleChange(newSocials);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        field.handleChange(
                          field.state.value.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    field.handleChange([
                      ...field.state.value,
                      { platform: "", url: "" },
                    ]);
                  }}
                  className="mt-2"
                >
                  <PlusIcon className="mr-2 h-4 w-4" /> Añadir Red Social
                </Button>
              </div>
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      <div className="flex cursor-pointer justify-end gap-4">
        <Button
          className="cursor-pointer"
          type="submit"
          disabled={form.state.isSubmitting || uploader.isPending}
        >
          {form.state.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
