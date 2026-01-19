import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { memeId } = await request.json();

    if (!memeId) {
      return NextResponse.json(
        { error: "Meme ID is required" },
        { status: 400 },
      );
    }

    // Check if already liked
    const existing = await sql`
      SELECT id FROM likes
      WHERE meme_id = ${memeId} AND user_id = ${session.user.id}
    `;

    let liked = false;

    if (existing.length > 0) {
      // Unlike
      await sql`
        DELETE FROM likes
        WHERE meme_id = ${memeId} AND user_id = ${session.user.id}
      `;

      await sql`
        UPDATE memes
        SET likes_count = likes_count - 1
        WHERE id = ${memeId}
      `;
    } else {
      // Like
      await sql`
        INSERT INTO likes (meme_id, user_id)
        VALUES (${memeId}, ${session.user.id})
      `;

      await sql`
        UPDATE memes
        SET likes_count = likes_count + 1
        WHERE id = ${memeId}
      `;

      liked = true;
    }

    // Get updated count
    const result = await sql`
      SELECT likes_count FROM memes WHERE id = ${memeId}
    `;

    return NextResponse.json({
      liked,
      likes_count: Number(result[0].likes_count),
    });
  } catch (error) {
    console.error("[v0] Failed to toggle like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
