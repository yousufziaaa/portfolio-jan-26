import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { departureMono, fragmentMono, reemKufi, nastaliq, bricolage, fraunces, gloock, geist, instrumentSans, instrumentSerif, inter, neueMachina } from "./fonts";

// Get the site URL from environment variable or use a default
// For production, set NEXT_PUBLIC_SITE_URL in your environment variables
// (Netlify sets URL at build time to the site's main address.)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "Yousuf Zia | Product Designer x Engineer",
  description: "Modern portfolio website showcasing creative design and development work",
  keywords: ["portfolio", "design", "development", "web design", "UI/UX"],
  authors: [{ name: "Yousuf Zia" }],
  // Icons come from app/icon.svg, app/favicon.ico and app/apple-icon.png.
  // scripts/brand.mjs builds them, along with public/og.png and og.mp4.
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Yousuf Zia | Product Designer x Engineer",
    description: "Modern portfolio website showcasing creative design and development work",
    type: "website",
    url: siteUrl,
    siteName: "Yousuf Zia | Product Designer x Engineer",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Yousuf Zia, in English and Urdu, on a green truck-art poster",
      },
    ],
    // The same card as a 12s loop (the Urdu written in, colour sweeping the
    // lattice); og.png stays the still for platforms that don't play video.
    // (Next doesn't resolve video URLs against metadataBase, so it's absolute here.)
    videos: [{ url: new URL("/og.mp4", siteUrl).toString(), width: 1200, height: 630, type: "video/mp4" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yousuf Zia | Product Designer x Engineer",
    description: "Modern portfolio website showcasing creative design and development work",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${departureMono.variable} ${neueMachina.variable} ${instrumentSerif.variable} ${inter.variable} ${geist.variable} ${instrumentSans.variable} ${fragmentMono.variable} ${reemKufi.variable} ${nastaliq.variable} ${bricolage.variable} ${fraunces.variable} ${gloock.variable} antialiased`}>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="514d85e6-0a8b-49ae-9e6b-f8e01d8fe353"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
