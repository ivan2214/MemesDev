import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";
import { MainLayout } from "@/shared/components/main-layout";
import { Toaster } from "@/shared/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://devmemes.com",
  ),
  title: {
    default: "DevMemes - Programming Memes for Developers",
    template: "%s | DevMemes",
  },
  description:
    "Discover and share the funniest programming memes. Upload, like, comment, and laugh with the developer community.",
  keywords: [
    "programming memes",
    "developer humor",
    "coding memes",
    "software engineering",
    "tech humor",
    "web development",
    "javascript memes",
  ],
  authors: [{ name: "DevMemes Team" }],
  creator: "DevMemes",
  publisher: "DevMemes",
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
    url: "/",
    siteName: "DevMemes",
    title: "DevMemes - Programming Memes for Developers",
    description:
      "Discover and share the funniest programming memes. Upload, like, comment, and laugh with the developer community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevMemes - Programming Memes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DevMemes - Programming Memes for Developers",
    description:
      "Discover and share the funniest programming memes. Upload, like, comment, and laugh with the developer community.",
    creator: "@devmemes",
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
        <MainLayout>{children}</MainLayout>
        <Analytics />
        <Toaster richColors />
      </body>
    </html>
  );
}
