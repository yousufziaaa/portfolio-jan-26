import FadeImage from "@/components/site/FadeImage";
import { preview } from "@/lib/placeholders";
import PageTitle from "@/components/site/PageTitle";
import { shots } from "@/data/lab";

export const metadata = { title: "Lab" };

export default function LabPage() {
  return (
    <>
      <PageTitle urdu="تجربہ گاہ">Lab</PageTitle>
      <p className="mt-9 text-[15px] leading-[1.65] text-ink-2">
        I&apos;ve been working on a lot of fun stuff in the lab recently. I&apos;m still working on polishing them, but
        they&apos;ll be here soon :) In the meanwhile, here are some snippets from my work over the last few years.
      </p>

      <section aria-label="Snippets" className="mt-10">
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
