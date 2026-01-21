/** biome-ignore-all lint/performance/noImgElement: <necessary> */
/** biome-ignore-all lint/a11y/useAltText: <necessary> */

import { getObject } from "@better-upload/server/helpers";
import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { db } from "@/db";
import { memesTable } from "@/db/schemas";
import { env } from "@/env/server";
import { s3 } from "@/lib/s3";

const size = {
  width: 1200,
  height: 630,
};

// Helper function to extract S3 key from image URL
function getS3KeyFromUrl(imageUrl: string): string | null {
  try {
    // URL format: https://bucket-url/memes/uuid.ext
    const bucketUrl = env.S3_BUCKET_URL;
    if (imageUrl.startsWith(bucketUrl)) {
      return imageUrl.slice(bucketUrl.length + 1); // +1 for the slash
    }
    // Try to extract from URL path
    const url = new URL(imageUrl);
    return url.pathname.slice(1); // Remove leading slash
  } catch {
    return null;
  }
}

// Helper function to get image from S3 and convert to PNG base64
async function getImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const key = getS3KeyFromUrl(imageUrl);

    if (!key) {
      console.error("[OG API] Could not extract key from URL:", imageUrl);
      return null;
    }

    console.log("[OG API] Fetching from S3 with key:", key);

    const { blob } = await getObject(s3, {
      bucket: env.S3_BUCKET_NAME,
      key,
    });

    if (!blob) {
      console.error("[OG API] No blob returned from S3");
      return null;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to PNG using sharp (handles webp, jpg, png, etc.)
    const pngBuffer = await sharp(buffer)
      .png()
      .resize(800, 450, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const base64 = pngBuffer.toString("base64");
    console.log("[OG API] Image converted to PNG successfully");
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error("[OG API] Error fetching/converting image:", error);
    return null;
  }
}

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

    // Fetch the meme image from S3 and convert to PNG base64
    const imageBase64 = await getImageAsBase64(meme.imageUrl);
    console.log("[OG API] Image ready:", !!imageBase64);

    // If image couldn't be fetched, show a fallback
    if (!imageBase64) {
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
            color: "white",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, display: "flex" }}>
            {meme.title || "Meme de programación"}
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.8,
              display: "flex",
              marginTop: 16,
            }}
          >
            MemesDev • {meme.user.name}
          </div>
        </div>,
        {
          ...size,
        },
      );
    }

    // Generate the OG image with the meme
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
          src={imageBase64}
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
