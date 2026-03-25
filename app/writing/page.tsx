import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";

export default function Writing() {
  const entries = getAllPosts();
  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 sm:px-12 md:px-16 lg:px-20 py-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-sm font-departure-mono transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground)" }}
        >
          ← Go back home
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="w-full mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-32">

        {/* Header */}
        <h1
          className="font-departure-mono mb-8"
          style={{ fontSize: "32px", fontWeight: "400", color: "var(--header)" }}
        >
          Writing
        </h1>
        <p
          className="font-neue-machina mb-8"
          style={{ fontSize: "16px", color: "var(--foreground)", lineHeight: "1.6" }}
        >
          A collection of snippets.
        </p>

        {/* Divider */}
        <div
          className="mb-6"
          style={{ borderTop: "1px solid var(--foreground)", opacity: 0.4 }}
        />

        {/* Entries — -mx-4 px-4 lets bg bleed 16px past text on each side */}
        <div className="flex flex-col">
          {entries.map((entry, i) => (
            <Link
              key={i}
              href={`/writing/${entry.slug}`}
              className="group flex w-[calc(100%+32px)] items-baseline justify-between gap-4 -mx-4 px-4 py-2.5 rounded-xl transition-colors duration-300 ease-out hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
            >
              <span
                className="font-neue-machina"
                style={{ fontSize: "16px", fontWeight: "400", color: "var(--header)" }}
              >
                {entry.title}
              </span>
              <span
                className="font-neue-machina shrink-0"
                style={{ fontSize: "14px", color: "var(--foreground)", opacity: 0.5 }}
              >
                {entry.date}
              </span>
            </Link>
          ))}
        </div>

      </div>

      {/* Footer */}
      <div className="mt-auto mx-auto w-full max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20">
        <Footer />
      </div>
    </main>
  );
}
