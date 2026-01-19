import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ memes: [] });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const searchTerm = `%${query.toLowerCase()}%`;

    const memes = await sql`
      SELECT 
        m.id,
        m.title,
        m.description,
        m.image_url,
        m.tags,
        m.likes_count,
        m.comments_count,
        m.created_at,
        u.id as user_id,
        u.name as user_name,
        ${userId ? sql`EXISTS(SELECT 1 FROM likes WHERE meme_id = m.id AND user_id = ${userId})` : sql`false`} as is_liked
      FROM memes m
      JOIN "user" u ON m.user_id = u.id
      WHERE 
        LOWER(m.title) LIKE ${searchTerm}
        OR LOWER(m.description) LIKE ${searchTerm}
        OR EXISTS (
          SELECT 1 FROM unnest(m.tags) tag
          WHERE LOWER(tag) LIKE ${searchTerm}
        )
      ORDER BY m.created_at DESC
      LIMIT 50
    `;

    const formattedMemes = memes.map((meme) => ({
      id: meme.id,
      title: meme.title,
      description: meme.description,
      image_url: meme.image_url,
      tags: meme.tags,
      likes_count: Number(meme.likes_count),
      comments_count: Number(meme.comments_count),
      created_at: meme.created_at,
      user: {
        id: meme.user_id,
        name: meme.user_name,
      },
      is_liked: meme.is_liked,
    }));

    return NextResponse.json({ memes: formattedMemes });
  } catch (error) {
    console.error("[v0] Failed to search memes:", error);
    return NextResponse.json(
      { error: "Failed to search memes" },
      { status: 500 },
    );
  }
}
