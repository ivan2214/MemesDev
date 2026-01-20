import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import { env } from "@/env/server";

import { Toaster } from "@/shared/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: "DevMemes - Memes de programación para desarrolladores",
    template: "%s | DevMemes",
  },
  description:
    "Descubre y comparte los memes de programación más divertidos. Sube, dale a 'me gusta', comenta y ríete con la comunidad de desarrolladores.",
  keywords: [
    "memes de programación",
    "humor de programadores",
    "memes de codificación",
    "ingeniería de software",
    "humor de tecnología",
    "desarrollo web",
    "memes de JavaScript",
    "memes de TypeScript",
    "memes de Nextjs",
    "memes de Java",
    "memes divertidos",
    "memes de C",
  ],
  authors: [{ name: "ivan2214", url: "https://github.com/Ivan2214" }],
  creator: "ivan2214",
  publisher: "ivan2214",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: env.APP_URL,
    siteName: "DevMemes",
    title: "DevMemes - Memes de programación para desarrolladores",
    description:
      "Descubre y comparte los memes de programación más divertidos. Sube, dale a 'me gusta', comenta y ríete con la comunidad de desarrolladores.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevMemes - Memes de programación para desarrolladores",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevMemes - Memes de programación para desarrolladores",
    description:
      "Descubre y comparte los memes de programación más divertidos. Sube, dale a 'me gusta', comenta y ríete con la comunidad de desarrolladores.",
    creator: "@bongiovanniDev",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster richColors />
      </body>
    </html>
  );
}
