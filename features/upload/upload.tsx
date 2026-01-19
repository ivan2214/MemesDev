"use client";

import { ImageIcon, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth";

export function UploadMeme() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);

      const response = await fetch("/api/memes/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload meme");
      }

      const data = await response.json();
      router.push(`/meme/${data.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to upload meme. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Upload a Meme</CardTitle>
          <CardDescription className="text-pretty">
            Share your programming humor with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Meme Image *</Label>
              <div className="flex flex-col gap-4">
                {preview ? (
                  <div className="relative">
                    {/** biome-ignore lint/performance/noImgElement: <temp> */}
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-96 w-full rounded-lg border border-border object-contain"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null);
                        setPreview("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border border-dashed bg-muted/50 transition-colors hover:bg-muted"
                  >
                    <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="font-medium text-foreground text-sm">
                      Click to upload an image
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="When the code finally works..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add context or a funny caption"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="javascript, react, debugging (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                Separate tags with commas to help others find your meme
              </p>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <Upload className="h-4 w-4" />
              {loading ? "Uploading..." : "Upload Meme"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
