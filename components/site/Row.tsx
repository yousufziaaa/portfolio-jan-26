"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTintHandlers } from "@/components/site/Shell";
import { StarMark } from "@/components/site/Ornament";

/** Hairline list row: a star in the row's colour, a title, a detail, a date. */
export function Row({
  href,
  colour = "var(--ink)",
  title,
  detail,
  note,
  meta,
}: {
  href?: string;
  colour?: string;
  title: ReactNode;
  /** Inline after the title, quieter. */
  detail?: ReactNode;
  /** A line under the title. */
  note?: ReactNode;
  meta?: ReactNode;
}) {
  const tint = useTintHandlers();
  const body = (
    <>
      <span className="pt-[5px] transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45">
        <StarMark colour={colour} />
      </span>
      <span className="min-w-0">
        <span className="block truncate">
          <span className="text-ink">{title}</span>
          {detail && (
            <span className="text-ink-3 transition-colors duration-150 ease-out group-hover:text-ink-2"> {detail}</span>
          )}
        </span>
        {note && <span className="mt-1 block text-[13px] leading-[1.55] text-ink-3">{note}</span>}
      </span>
      {meta && <span className="tnum pt-[2px] text-[13px] text-ink-3">{meta}</span>}
    </>
  );
  const cls = "group grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-2 py-3 text-[15px] outline-none";
  return (
    <li className="border-b border-rule">
      {href ? (
        <Link href={href} className={cls} {...tint(colour)}>
          {body}
        </Link>
      ) : (
        <div className={cls} {...tint(colour)}>
          {body}
        </div>
      )}
    </li>
  );
}

export function RowList({ label, children, className = "" }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {label && (
        <h2 className="mb-3 text-[13px] font-normal tracking-normal text-ink-3" style={{ fontFamily: "inherit" }}>
          {label}
        </h2>
      )}
      <ul className="border-t border-rule">{children}</ul>
    </section>
  );
}
