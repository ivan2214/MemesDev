import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;

  try {
    const comments = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.name as user_name
      FROM comments c
      JOIN "user" u ON c.user_id = u.id
      WHERE c.meme_id = ${id}
      ORDER BY c.created_at DESC
    `;

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      user: {
        id: comment.user_id,
        name: comment.user_name,
      },
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error("[v0] Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO comments (meme_id, user_id, content)
      VALUES (${id}, ${session.user.id}, ${content})
      RETURNING id, content, created_at
    `;

    await sql`
      UPDATE memes
      SET comments_count = comments_count + 1
      WHERE id = ${id}
    `;

    const comment = {
      id: result[0].id,
      content: result[0].content,
      created_at: result[0].created_at,
      user: {
        id: session.user.id,
        name: session.user.name,
      },
    };

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("[v0] Failed to post comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 },
    );
  }
}
