/** biome-ignore-all lint/performance/noImgElement: <necessary> */
/** biome-ignore-all lint/a11y/useAltText: <necessary> */

import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";

// Image metadata
export const alt = "Meme Preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    console.log("[OG] Generating image for id:", id);

    // Query directly without "use cache" to avoid Route Handler issues
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

    console.log("[OG] Meme found:", !!meme);

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

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b", // zinc-950
          overflow: "hidden",
        }}
      >
        {/* Background Image (blurred) */}

        <img
          src={meme.imageUrl}
          style={{
            position: "absolute",
            width: "1200px",
            height: "630px",
            objectFit: "cover",
            filter: "blur(40px)",
            opacity: 0.5,
            transform: "scale(1.1)", // avoid edges from blur
          }}
        />

        {/* Branding/Logo Watermark */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              color: "#fff",
              padding: "8px 24px",
              borderRadius: "999px",
              fontSize: 24,
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            MemesDev
          </div>
        </div>

        {/* Meme Image Container */}
        <div
          style={{
            display: "flex",
            maxWidth: "1000px",
            maxHeight: "500px",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <img
            src={meme.imageUrl}
            style={{
              maxHeight: "500px",
              maxWidth: "1000px",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {/* Title / User info */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              maxWidth: "80%",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {meme.title || "Meme de programación"}
          </div>
          <div style={{ fontSize: 20, opacity: 0.9 }}>
            Subido por {meme.user.name}
          </div>
        </div>
      </div>,
      {
        ...size,
      },
    );
  } catch (error) {
    console.error("[OG] Error generating image:", error);
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
