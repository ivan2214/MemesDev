import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

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
      ORDER BY RANDOM()
      LIMIT 1
    `;

    if (memes.length === 0) {
      return NextResponse.json({ error: "No memes found" }, { status: 404 });
    }

    const meme = {
      id: memes[0].id,
      title: memes[0].title,
      description: memes[0].description,
      image_url: memes[0].image_url,
      tags: memes[0].tags,
      likes_count: Number(memes[0].likes_count),
      comments_count: Number(memes[0].comments_count),
      created_at: memes[0].created_at,
      user: {
        id: memes[0].user_id,
        name: memes[0].user_name,
      },
      is_liked: memes[0].is_liked,
    };

    return NextResponse.json({ meme });
  } catch (error) {
    console.error("[v0] Failed to fetch random meme:", error);
    return NextResponse.json(
      { error: "Failed to fetch random meme" },
      { status: 500 },
    );
  }
}
