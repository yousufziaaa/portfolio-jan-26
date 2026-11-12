import FadeImage from "@/components/site/FadeImage";
import { preview } from "@/lib/placeholders";
import PageTitle from "@/components/site/PageTitle";
import { Row, RowList } from "@/components/site/Row";
import { experiments, shots } from "@/data/lab";

export const metadata = { title: "Lab" };

export default function LabPage() {
  return (
    <>
      <PageTitle urdu="تجربہ گاہ">Lab</PageTitle>
      <p className="mt-9 text-[15px] leading-[1.65] text-ink-2">
        Experiments and things I&apos;ve built for fun, mostly to see if they&apos;d work.
      </p>

      <RowList label="Experiments" className="mt-12">
        {experiments.map((e) => (
          <Row key={e.slug} href={e.href} colour={e.colour} title={e.title} note={e.description} meta={e.year} />
        ))}
      </RowList>

      <section className="mt-12">
        <h2 className="mb-3 text-[13px] font-normal tracking-normal text-ink-3" style={{ fontFamily: "inherit" }}>
          Shots
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {shots.map((s) => (
            <div key={s.src} className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-black/10">
              <FadeImage src={s.src} alt={s.alt} fill sizes="(max-width: 560px) 50vw, 240px" className="object-cover" preview={preview(s.src)} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
