/** biome-ignore-all lint/performance/noImgElement: <necessary> */
import { ImageResponse } from "next/og";
import { getMeme } from "./_actions";

// export const runtime = "edge";
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
  const { id } = await params;
  // We can't use getMeme directly if it uses headers() and we are in edge runtime without proper polyfills sometimes,
  // OR if getMeme has side effects.
  // getMeme uses 'use server' which acts as an RPC call if imported in client, but here we are on server.
  // However, getMeme imports 'next/headers' which is supported in App Router edge runtime.
  // Note: If db connection (Postgres) is not edge compatible, this will fail in edge runtime.
  // Drizzle with neon-http IS edge compatible.

  const meme = await getMeme(id);

  if (!meme) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Meme Not Found
      </div>,
      { ...size },
    );
  }

  return new ImageResponse(
    <div
      style={{
        background: "#09090b", // zinc-950
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={meme.imageUrl}
        alt={meme.title || "Meme"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: 0.5,
          position: "absolute",
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "90%",
          height: "80%",
          background: "#18181b", // zinc-900
          borderRadius: 24,
          border: "2px solid #27272a", // zinc-800
          flexDirection: "row",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            padding: 20,
          }}
        >
          <img
            alt={meme.title || "Meme"}
            src={meme.imageUrl}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        </div>
        <div
          style={{
            width: 400,
            display: "flex",
            flexDirection: "column",
            padding: 40,
            justifyContent: "center",
            color: "white",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              marginBottom: 20,
              lineHeight: 1.2,
              background: "linear-gradient(to right, #fff, #a1a1aa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {meme.title || "Untitled Meme"}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
            {/* User info */}
            {meme.user.image && (
              <img
                alt={meme.user.name}
                src={meme.user.image}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  marginRight: 16,
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 24, fontWeight: 600 }}>
                {meme.user.name}
              </span>
              <span style={{ fontSize: 18, color: "#a1a1aa" }}>
                MemesDev Author
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              gap: 20,
              color: "#a1a1aa",
              fontSize: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              ❤️ {meme.likesCount}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              💬 {meme.commentsCount}
            </div>
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
