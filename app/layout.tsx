import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { departureMono, fragmentMono, reemKufi, nastaliq, bricolage, fraunces, gloock, geist, instrumentSans, instrumentSerif, inter, neueMachina } from "./fonts";

// The address share cards and crawlers resolve against. Defaults to the
// live domain (not the host's preview URL, and never localhost, which no
// crawler can fetch); set NEXT_PUBLIC_SITE_URL to override.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yousufzia.com";

const description =
  "Currently designing at Latent; previously Nvidia, Groq, Phia and Klarify.";

export const metadata: Metadata = {
  title: "designing the details",
  description,
  authors: [{ name: "Yousuf Zia" }],
  // Icons come from app/icon.svg, app/favicon.ico and app/apple-icon.png.
  // scripts/brand.mjs builds them, along with public/og.png and og.mp4.
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "designing the details",
    description,
    type: "website",
    url: siteUrl,
    siteName: "Yousuf Zia",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Yousuf Zia, in English and Urdu, on a green truck-art poster",
      },
    ],
    // The same card as a 12s loop (the Urdu written in, colour sweeping the
    // lattice); iMessage plays it inline, and og.png stays the still for
    // everything else. If LinkedIn keeps filing the page as a video with no
    // image, serve this to everyone but LinkedInBot.
    // (Next doesn't resolve video URLs against metadataBase, so it's absolute here.)
    videos: [{ url: new URL("/og.mp4", siteUrl).toString(), width: 1200, height: 630, type: "video/mp4" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "designing the details",
    description,
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
