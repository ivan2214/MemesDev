"use client";

import { useUploadFiles } from "@better-upload/client";
import { useForm } from "@tanstack/react-form";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { UploadDropzoneProgress } from "@/components/ui/upload-dropzone-progress";

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
  files: z.array(z.file()).min(1, "Sube al menos un archivo"),
});

export function UploadMeme() {
  const [newTag, setNewTag] = useState<{
    id: string;
    label: string;
  }>({
    id: "",
    label: "",
  });

  const form = useForm({
    defaultValues: {
      tags: [
        {
          id: "",
          label: "",
        },
      ],
      files: [] as File[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { files } = await uploader.upload(value.files);

      // call your API here
      console.log({
        tags: value.tags,
        objectKeys: files.map((file) => file.objectInfo.key),
      });
    },
  });

  const uploader = useUploadFiles({
    route: "memes",
  });

  const handleRemove = (id: string) => {
    const selected = form.state.values.tags;
    if (!selected.some((t) => t.id === id)) {
      return;
    }
    console.log(`removed: ${id}`);
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
    console.log(`selected: ${id}`);
    form.setFieldValue("tags", [...selected, { id: id, label: value }]);
  };
  const handleCreateTag = () => {
    console.log(`created: ${newTag}`);

    form.setFieldValue("tags", [...form.state.values.tags, newTag]);

    setNewTag({
      id: "",
      label: "",
    });
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Form Uploader</CardTitle>
        <CardDescription>Upload files to a specific folder.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="uploader-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="tags">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const tags = field.state.value.filter(
                  (t) => t.id !== "" && t.label !== "",
                );

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
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
                          onValueChange={(value) => {
                            setNewTag({
                              id: value,
                              label: value,
                            });
                          }}
                          placeholder="Search tag..."
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
                              Create new tag: {newTag.label}
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
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
            <form.Field name="files">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched && !field.state.meta.isValid) ||
                  uploader.isError;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Folder name</FieldLabel>
                    {field.state.value.length > 0 ? (
                      <div className="flex flex-col">
                        {field.state.value.map((file) => (
                          <span key={file.name} className="text-sm">
                            {file.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <UploadDropzoneProgress
                        id={field.name}
                        control={uploader.control}
                        description={{
                          maxFiles: 5,
                          maxFileSize: "5MB",
                        }}
                        uploadOverride={(files) => {
                          field.handleChange(Array.from(files));
                        }}
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
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              uploader.reset();
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="uploader-form"
            disabled={uploader.isPending}
          >
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
