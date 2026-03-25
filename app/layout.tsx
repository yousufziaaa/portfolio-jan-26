import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { departureMono, neueMachina } from "./fonts";

// Get the site URL from environment variable or use a default
// For production, set NEXT_PUBLIC_SITE_URL in your environment variables
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  title: "Yousuf Zia | Product Designer x Engineer",
  description: "Modern portfolio website showcasing creative design and development work",
  keywords: ["portfolio", "design", "development", "web design", "UI/UX"],
  authors: [{ name: "Yousuf Zia" }],
  icons: {
    icon: "/favicon-portfolio.png",
    shortcut: "/favicon-portfolio.png",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Yousuf Zia | Product Designer x Engineer",
    description: "Modern portfolio website showcasing creative design and development work",
    type: "website",
    url: siteUrl,
    siteName: "Yousuf Zia | Product Designer x Engineer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yousuf Zia | Product Designer x Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yousuf Zia | Product Designer x Engineer",
    description: "Modern portfolio website showcasing creative design and development work",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${departureMono.variable} ${neueMachina.variable} antialiased`}>
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
