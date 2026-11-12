import { notFound } from "next/navigation";
import PageTitle from "@/components/site/PageTitle";
import { Row, RowList } from "@/components/site/Row";
import { getAllPosts, shortDate } from "@/lib/posts";
import { SHOW_WRITING } from "@/lib/flags";

export const metadata = { title: "Writing" };

export default function Writing() {
  if (!SHOW_WRITING) notFound();
  const posts = getAllPosts();
  return (
    <>
      <PageTitle urdu="تحریریں">Writing</PageTitle>
      <p className="mt-9 text-[15px] leading-[1.65] text-ink-2">Notes on design, building, and whatever else I&apos;m chewing on.</p>

      <RowList className="mt-12">
        {posts.map((p) => (
          <Row key={p.slug} href={`/writing/${p.slug}`} title={p.title} meta={shortDate(p.date)} />
        ))}
      </RowList>
    </>
  );
}
