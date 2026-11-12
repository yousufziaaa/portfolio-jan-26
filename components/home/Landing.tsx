"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useTintHandlers } from "@/components/site/Shell";
import PageTitle from "@/components/site/PageTitle";
import { COMPANY, DEFAULT_PLATE } from "@/components/site/palette";
import { links, visibleWork } from "@/data/work";

/**
 * Home. One screen, no scroll. Each company is a colour plate with black
 * lettering, like truck-art signwriting; hovering one fills the lattice
 * with its colour.
 */

/** A company name as a colour plate. Links when it has a case study. */
function Plate({ id, children }: { id: string; children: ReactNode }) {
  const tint = useTintHandlers();
  const cls =
    "rounded-[3px] px-[5px] py-[1px] font-medium text-[#121212] outline-none [box-decoration-break:clone] focus-visible:ring-2 focus-visible:ring-[#121212]";
  const style = { backgroundColor: COMPANY[id] };
  return visibleWork.some((w) => w.slug === id) ? (
    <Link href={`/projects/${id}`} className={cls} style={style} {...tint(COMPANY[id])}>
      {children}
    </Link>
  ) : (
    <span className={`${cls} cursor-default`} style={style} {...tint(COMPANY[id])}>
      {children}
    </span>
  );
}

/**
 * One line of the work index: title, role, a dotted leader, dates. On hover
 * the title turns into the company's colour plate and the lattice lights.
 */
function WorkLine({ slug, title, role, dates }: { slug: string; title: string; role: string; dates: string }) {
  const tint = useTintHandlers();
  const colour = COMPANY[slug] ?? DEFAULT_PLATE;
  return (
    <li>
      <Link
        href={`/projects/${slug}`}
        {...tint(colour)}
        className="group flex items-baseline gap-3 py-[7px] text-[15px] outline-none"
        style={{ "--plate": colour } as CSSProperties}
      >
        <span className="-mx-[5px] rounded-[3px] px-[5px] py-[1px] font-medium text-ink transition-colors duration-150 ease-out group-hover:bg-[var(--plate)] group-hover:text-[#121212] group-focus-visible:bg-[var(--plate)] group-focus-visible:text-[#121212]">
          {title}
        </span>
        <span className="hidden text-ink-3 sm:inline">{role}</span>
        <span aria-hidden className="min-w-6 flex-1 translate-y-[-4px] border-b-[1.5px] border-dotted border-ink-3 opacity-60" />
        <span className="tnum shrink-0 text-[13px] text-ink-3">{dates}</span>
      </Link>
    </li>
  );
}

function Home() {
  return (
    <>
      <PageTitle urdu="یوسف ضیاء">Yousuf Zia</PageTitle>

      <p className="mt-9 text-[15px] leading-[1.7] text-ink-2">
        Currently designing @ <Plate id="latent">Latent</Plate>. In a past life, built tools at{" "}
        <Plate id="nvidia">Nvidia</Plate>, design systems at <Plate id="groq">Groq</Plate>, and growth at{" "}
        <Plate id="phia">Phia</Plate> and <Plate id="klarify">Klarify</Plate>.
      </p>

      <section className="mt-11">
        <h2 className="mb-3 text-[13px] font-normal tracking-normal text-ink-3" style={{ fontFamily: "inherit" }}>
          Selected work
        </h2>
        <ul>
          {visibleWork.map((w) => (
            <WorkLine key={w.slug} slug={w.slug} title={w.title} role={w.role} dates={w.dateRange} />
          ))}
        </ul>
      </section>

      <nav aria-label="Elsewhere" className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
        {links.map((l) => {
          const external = l.href.startsWith("http") || l.href.endsWith(".pdf");
          return (
            <a
              key={l.label}
              href={l.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-ink-2 underline decoration-rule decoration-1 underline-offset-[5px] transition-colors duration-150 ease-out hover:text-ink hover:decoration-ink-3"
            >
              {l.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}

export default Home;
