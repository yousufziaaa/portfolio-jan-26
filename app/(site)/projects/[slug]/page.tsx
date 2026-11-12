import { notFound } from "next/navigation";
import PageTitle from "@/components/site/PageTitle";
import { StarMark } from "@/components/site/Ornament";
import ParagraphWithLinks from "@/components/ParagraphWithLinks";
import { COMPANY, DEFAULT_PLATE } from "@/components/site/palette";
import FadeImage from "@/components/site/FadeImage";
import CaseFooter from "@/components/site/CaseFooter";
import { preview } from "@/lib/placeholders";
import { projectContents } from "@/data/projects";
import { visibleWork, work } from "@/data/work";

/**
 * Case study. Same shell and column as the rest of the site; the shell
 * gives it a deep ground and lattice tone from the company's colour, and
 * highlighted phrases are underlined in it.
 */

export function generateStaticParams() {
  return Object.keys(projectContents).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = projectContents[params.slug];
  return { title: project?.title ?? "Project" };
}

function Paragraphs({ items, tone }: { items: string[]; tone: string }) {
  return (
    <>
      {items.map((text, i) => (
        <p key={i} className="mt-4 text-[15px] leading-[1.65] text-ink-2 first:mt-0">
          <ParagraphWithLinks text={text} tone={tone} />
        </p>
      ))}
    </>
  );
}

/** Images run a little wider than the text column on large screens. */
function Figures({ images, label }: { images: string[]; label: string }) {
  const grid = images.length === 4 || images.length === 2;
  return (
    <div className="relative left-1/2 mt-8 w-[min(720px,calc(100vw-48px))] -translate-x-1/2">
      <div className={grid ? "grid grid-cols-2 gap-2" : "space-y-3"}>
        {images.map((src, i) => (
          <div key={src} className="relative overflow-hidden rounded-[6px] bg-black/10 ring-1 ring-black/10">
            <FadeImage
              src={src}
              alt={`${label}, image ${i + 1}`}
              width={1200}
              height={675}
              sizes={grid ? "(max-width: 768px) 50vw, 360px" : "(max-width: 768px) 100vw, 720px"}
              preview={preview(src)}
              className="block h-auto w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projectContents[params.slug];
  if (!project) notFound();

  const colour = COMPANY[params.slug] ?? DEFAULT_PLATE;
  const meta = work.find((w) => w.slug === params.slug);
  const i = visibleWork.findIndex((w) => w.slug === params.slug);
  const next = i >= 0 ? visibleWork[(i + 1) % visibleWork.length] : undefined;

  return (
    <>
      <article>
        <PageTitle>{project.title}</PageTitle>

        {/* Overview: the facts, then the summary, set apart from the body on
            a lifted panel. */}
        <section
          id="preface"
          aria-label="Overview"
          className="mt-8 overflow-hidden rounded-[6px] bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]"
        >
          <dl className="grid grid-cols-3 gap-4 px-5 pb-4 pt-5 text-[14px]">
            {[
              ["Role", meta?.role ?? "Designer"],
              ["Timeline", project.dateRange.replace(" - ", " – ")],
              ["Length", meta ? `${meta.months} months` : "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-ink-3">{k}</dt>
                <dd className="tnum mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {project.preface.length > 0 && (
            <div className="border-t border-rule px-5 pb-5 pt-4">
              {project.preface.map((text, k) => (
                <p key={k} className="mt-4 text-[15px] leading-[1.65] text-ink-2 first:mt-0">
                  <ParagraphWithLinks text={text} tone={colour} />
                </p>
              ))}
            </div>
          )}
        </section>

        {project.sections
          .filter((s) => s.content.length > 0 || s.subsections?.length || s.images?.length)
          .map((section) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-10">
            <h2
              className="mb-4 flex items-center gap-2 text-[15px] font-medium tracking-normal text-ink"
              style={{ fontFamily: "inherit" }}
            >
              {section.level === 1 && <StarMark colour={colour} />}
              {section.title}
            </h2>
            <Paragraphs items={section.content} tone={colour} />

            {section.subsections?.map((sub) => (
              <div key={sub.id} id={sub.id} className="mt-10 scroll-mt-10">
                <h3
                  className="mb-3 text-[15px] font-medium tracking-normal text-ink-2"
                  style={{ fontFamily: "inherit" }}
                >
                  {sub.title}
                </h3>
                <Paragraphs items={sub.content} tone={colour} />
                {sub.images && sub.images.length > 0 && <Figures images={sub.images} label={sub.title} />}
              </div>
            ))}

            {section.images && section.images.length > 0 && <Figures images={section.images} label={section.title} />}
          </section>
        ))}

        {project.conclusion && (
          <section id="conclusion" className="mt-14">
            <h2
              className="mb-4 flex items-center gap-2 text-[15px] font-medium tracking-normal text-ink"
              style={{ fontFamily: "inherit" }}
            >
              <StarMark colour={colour} />
              Conclusion
            </h2>
            <Paragraphs items={project.conclusion} tone={colour} />
          </section>
        )}

        <CaseFooter
          next={
            next && next.slug !== params.slug
              ? { slug: next.slug, title: next.title, colour: COMPANY[next.slug] ?? DEFAULT_PLATE }
              : undefined
          }
        />
      </article>
    </>
  );
}
