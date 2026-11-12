"use client";

import Link from "next/link";
import { StarMark } from "@/components/site/Ornament";
import { useTintHandlers } from "@/components/site/Shell";
import { navFace, navType } from "@/components/site/type";

/**
 * The foot of a case study, lettered like the nav: back to the top on the
 * left, on to the next project on the right. The next company's colour is
 * kept to its star and the lattice, which lights up in it on hover, as the
 * work rows on the home page do.
 */
export default function CaseFooter({ next }: { next?: { slug: string; title: string; colour: string } }) {
  const tint = useTintHandlers();

  const toTop = () => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
  };

  return (
    <footer className={`mt-20 flex items-baseline justify-between gap-4 border-t border-rule pt-5 ${navType}`} style={navFace}>
      <button
        type="button"
        onClick={toTop}
        className="group flex items-center gap-[7px] text-ink-3 underline-offset-[5px] outline-none transition-colors duration-150 ease-out hover:text-ink focus-visible:text-ink focus-visible:underline"
      >
        <span
          aria-hidden
          className="transition-transform duration-200 ease-out group-hover:-translate-y-[2px] motion-reduce:transition-none"
        >
          ↑
        </span>
        Back to top
      </button>

      {next && (
        <Link
          href={`/projects/${next.slug}`}
          {...tint(next.colour)}
          aria-label={`Next project: ${next.title}`}
          className="group flex items-center gap-[7px] text-ink underline-offset-[5px] outline-none focus-visible:underline"
        >
          <StarMark colour={next.colour} size={9} />
          {next.title}
          <span
            aria-hidden
            className="text-ink-3 transition-[transform,color] duration-200 ease-out group-hover:translate-x-[3px] group-hover:text-ink motion-reduce:transition-none"
          >
            →
          </span>
        </Link>
      )}
    </footer>
  );
}
