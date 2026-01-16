import type { Metadata } from "next";
import "./globals.css";
import { departureMono, neueMachina } from "./fonts";

export const metadata: Metadata = {
  title: "Portfolio | Your Name",
  description: "Modern portfolio website showcasing creative design and development work",
  keywords: ["portfolio", "design", "development", "web design", "UI/UX"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Portfolio | Your Name",
    description: "Modern portfolio website showcasing creative design and development work",
    type: "website",
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
