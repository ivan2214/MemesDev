/** biome-ignore-all lint/performance/noImgElement: <necessary> */
/** biome-ignore-all lint/a11y/useAltText: <necessary> */
import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";

const size = {
  width: 1200,
  height: 630,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("[OG API] Generating image for id:", id);

    const meme = await db.query.memesTable.findFirst({
      where: eq(memesTable.id, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log("[OG API] Meme found:", !!meme);

    if (!meme) {
      return new ImageResponse(
        <div
          style={{
            fontSize: 48,
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Meme no encontrado
        </div>,
        {
          ...size,
        },
      );
    }

    // Simplified template for Satori compatibility
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          position: "relative",
        }}
      >
        {/* Main meme image */}
        <img
          src={meme.imageUrl}
          width={800}
          height={450}
          style={{
            objectFit: "contain",
            borderRadius: 12,
          }}
        />

        {/* Title at bottom */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 20,
            color: "white",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, display: "flex" }}>
            {meme.title || "Meme de programación"}
          </div>
          <div
            style={{
              fontSize: 20,
              opacity: 0.8,
              display: "flex",
              marginTop: 8,
            }}
          >
            MemesDev • {meme.user.name}
          </div>
        </div>
      </div>,
      {
        ...size,
      },
    );
  } catch (error) {
    console.error("[OG API] Error generating image:", error);
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error generating preview
      </div>,
      {
        ...size,
      },
    );
  }
}
