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

// Helper function to fetch from external URL and convert to PNG base64
async function fetchExternalImage(imageUrl: string): Promise<Buffer | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(
        "[OG API] Failed to fetch external image:",
        response.status,
      );
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[OG API] Error fetching external image:", error);
    return null;
  }
}

// Helper function to get image and convert to PNG base64
async function getImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const key = getS3KeyFromUrl(imageUrl);
    let buffer: Buffer | null = null;

    // Check if it's an S3 image (has memes/ prefix)
    if (key && key.startsWith("memes/")) {
      const { blob } = await getObject(s3, {
        bucket: env.S3_BUCKET_NAME,
        key,
      });

      if (blob) {
        const arrayBuffer = await blob.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      }
    }

    // If not S3 or S3 failed, try external fetch
    if (!buffer) {
      buffer = await fetchExternalImage(imageUrl);
    }

    if (!buffer) {
      console.error("[OG API] Could not fetch image from any source");
      return null;
    }

    // Convert to PNG using sharp (handles webp, jpg, png, etc.)
    const pngBuffer = await sharp(buffer)
      .png()
      .resize(1100, 500, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const base64 = pngBuffer.toString("base64");

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
          width={1100}
          height={500}
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
            marginTop: 12,
            color: "white",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, display: "flex" }}>
            {meme.title || "Meme de programación"}
          </div>
          <div
            style={{
              fontSize: 18,
              opacity: 0.8,
              display: "flex",
              marginTop: 4,
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
