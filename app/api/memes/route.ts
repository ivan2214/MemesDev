import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "12");
  const sortBy = searchParams.get("sort") || "recent";

  try {
    console.log(
      "[v0] Fetching memes with offset:",
      offset,
      "limit:",
      limit,
      "sort:",
      sortBy,
    );

    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    console.log("[v0] User session:", userId ? "logged in" : "guest");

    let memes;
    if (sortBy === "hot") {
      if (userId) {
        memes = await db`
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
            EXISTS(SELECT 1 FROM likes WHERE meme_id = m.id AND user_id = ${userId}) as is_liked
          FROM memes m
          JOIN "user" u ON m.user_id = u.id
          ORDER BY (m.likes_count + m.comments_count * 2) DESC, m.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        memes = await sql`
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
            false as is_liked
          FROM memes m
          JOIN "user" u ON m.user_id = u.id
          ORDER BY (m.likes_count + m.comments_count * 2) DESC, m.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      }
    } else {
      if (userId) {
        memes = await sql`
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
            EXISTS(SELECT 1 FROM likes WHERE meme_id = m.id AND user_id = ${userId}) as is_liked
          FROM memes m
          JOIN "user" u ON m.user_id = u.id
          ORDER BY m.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        memes = await sql`
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
            false as is_liked
          FROM memes m
          JOIN "user" u ON m.user_id = u.id
          ORDER BY m.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      }
    }

    console.log("[v0] Fetched", memes.length, "memes");

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
    console.error("[v0] Failed to fetch memes - Full error:", error);
    console.error(
      "[v0] Error name:",
      error instanceof Error ? error.name : "Unknown",
    );
    console.error(
      "[v0] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "[v0] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );

    return NextResponse.json(
      {
        error: "Failed to fetch memes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
