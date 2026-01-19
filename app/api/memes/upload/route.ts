import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tagsString = formData.get("tags") as string;

    if (!image || !title) {
      return NextResponse.json(
        { error: "Image and title are required" },
        { status: 400 },
      );
    }

    // Upload image to Vercel Blob
    const blob = await put(`memes/${Date.now()}-${image.name}`, image, {
      access: "public",
    });

    // Parse tags
    const tags = tagsString
      ? tagsString.split(",").map((tag) => tag.trim().toLowerCase())
      : [];

    // Insert meme into database
    const result = await db.insert(memesTable).values({
      userId: session.user.id,
      title,
      description,
      imageUrl: blob.url,
      tags,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[v0] Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload meme" },
      { status: 500 },
    );
  }
}
