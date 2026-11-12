import { notFound } from "next/navigation";
import PageTitle from "@/components/site/PageTitle";
import { getAllPosts, getPost, shortDate } from "@/lib/posts";
import { SHOW_WRITING } from "@/lib/flags";

export async function generateStaticParams() {
  if (!SHOW_WRITING) return [];
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!SHOW_WRITING) return {};
  const post = await getPost(params.slug);
  return { title: post.title };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  if (!SHOW_WRITING) notFound();
  const post = await getPost(params.slug);

  return (
    <>
      <article>
        <PageTitle aside={shortDate(post.date)}>{post.title}</PageTitle>
        <div
          className="prose-writing mt-9 text-[15px] leading-[1.65] text-ink-2"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </>
  );
}
