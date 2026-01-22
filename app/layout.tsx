import type { Metadata } from "next";
import "./globals.css";
import { departureMono, neueMachina } from "./fonts";

export const metadata: Metadata = {
  title: "Yousuf's Portfolio",
  description: "Modern portfolio website showcasing creative design and development work",
  keywords: ["portfolio", "design", "development", "web design", "UI/UX"],
  authors: [{ name: "Yousuf" }],
  icons: {
    icon: "/favicon-portfolio.png",
    shortcut: "/favicon-portfolio.png",
  },
  openGraph: {
    title: "Yousuf's Portfolio",
    description: "Modern portfolio website showcasing creative design and development work",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yousuf's Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yousuf's Portfolio",
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
        {children}
      </body>
    </html>
  );
}
