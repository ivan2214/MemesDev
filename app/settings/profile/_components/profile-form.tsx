"use client";

import { useUploadFile } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";

import { PlusIcon, TrashIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { updateProfile } from "@/app/settings/profile/_actions";
import {
  type ProfileSchema,
  profileSchema,
} from "@/app/settings/profile/_validators";
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
  TagsInput,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/shared/components/ui/shadcn-io/tags";
import { Textarea } from "@/shared/components/ui/textarea";
import { UploadDropzone } from "@/shared/components/ui/upload-dropzone";
import type { UserSettings } from "../_types";

interface ProfileFormProps {
  initialData: UserSettings | null;
}

const profileFormSchema = profileSchema.extend({
  imageFile: z.file(),
});

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [newTag, setNewTag] = useState<{ id: string; label: string } | null>(
    null,
  );

  const form = useForm({
    defaultValues: {
      name: initialData?.name || "",
      bio: initialData?.bio || "",
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      socials: initialData?.socials || [],
      imageKey: initialData?.imageKey || "",
      imageFile: undefined as never as File,
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
      const data: ProfileSchema = {
        ...value,
      };
      if (!value.imageFile) {
        const { file } = await uploader.upload(value.imageFile);
        data.imageKey = file.objectInfo.key;
      }

      try {
        await updateProfile(data);
        toast.success("Perfil actualizado correctamente");
      } catch (error) {
        console.error(error);
        toast.error("Error al actualizar el perfil");
      }
    },
  });

  const uploader = useUploadFile({
    route: "avatar",
  });

  const handleRemoveTag = (id: string) => {
    const selected = form.state.values.tags;
    form.setFieldValue(
      "tags",
      selected.filter((t) => t.id !== id),
    );
  };

  const handleCreateTag = () => {
    if (!newTag) return;
    form.setFieldValue("tags", [...form.state.values.tags, newTag]);
    setNewTag(null);
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
            return (
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <div className="flex flex-col gap-4">
                  {field.state.value ? (
                    <div className="relative h-32 w-32">
                      {/* Try to display image. Use a placeholder logic if needed */}
                      <Image
                        src={URL.createObjectURL(field.state.value)}
                        alt="Avatar"
                        className="h-full w-full rounded-full border object-cover"
                        onError={(e) => {
                          // Fallback if image fails (e.g. it's just a key without domain)
                          e.currentTarget.src = "https://github.com/shadcn.png";
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() =>
                          field.handleChange(undefined as never as File)
                        }
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
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Categoría del Perfil</FieldLabel>
              <Input
                id={field.name}
                placeholder="Ej. Creador de Memes, Curador..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          )}
        </form.Field>

        {/* Tags */}
        <form.Field name="tags">
          {(field) => (
            <Field>
              <FieldLabel>Tags</FieldLabel>
              <Tags className="max-w-md">
                <TagsTrigger placeholder="Etiquetas...">
                  {field.state.value.map((tag) => (
                    <TagsValue
                      key={tag.id}
                      onRemove={() => handleRemoveTag(tag.id)}
                    >
                      {tag.label}
                    </TagsValue>
                  ))}
                </TagsTrigger>
                <TagsContent>
                  <TagsInput
                    value={newTag?.label || ""}
                    onValueChange={(val) => setNewTag({ id: val, label: val })}
                    placeholder="Nueva etiqueta..."
                  />
                  <TagsList>
                    <TagsEmpty>
                      <button
                        className="flex items-center gap-2"
                        onClick={handleCreateTag}
                        type="button"
                      >
                        <PlusIcon size={14} /> Creart "{newTag?.label}"
                      </button>
                    </TagsEmpty>
                  </TagsList>
                </TagsContent>
              </Tags>
            </Field>
          )}
        </form.Field>

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
                        newSocials[index].platform = e.target.value;
                        field.handleChange(newSocials);
                      }}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="URL"
                      value={social.url}
                      onChange={(e) => {
                        const newSocials = [...field.state.value];
                        newSocials[index].url = e.target.value;
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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Restablecer
        </Button>
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
