import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { getPost, getAllPosts } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 sm:px-12 md:px-16 lg:px-20 py-6 flex justify-between items-center">
        <Link
          href="/writing"
          className="text-sm font-departure-mono transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground)" }}
        >
          ← Back to writing
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="w-full mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-32">

        {/* Header */}
        <h1
          className="font-departure-mono mb-4"
          style={{ fontSize: "32px", fontWeight: "400", color: "var(--header)" }}
        >
          {post.title}
        </h1>
        <p
          className="font-neue-machina mb-8"
          style={{ fontSize: "14px", color: "var(--foreground)", opacity: 0.5 }}
        >
          {post.date}
        </p>

        {/* Divider */}
        <div
          className="mb-10"
          style={{ borderTop: "1px solid var(--foreground)", opacity: 0.4 }}
        />

        {/* Body */}
        <div
          className="font-neue-machina prose-writing"
          style={{ fontSize: "16px", color: "var(--foreground)", lineHeight: "1.75" }}
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

      </div>

      {/* Footer */}
      <div className="mt-auto mx-auto w-full max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20">
        <Footer />
      </div>
    </main>
  );
}
