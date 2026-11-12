import type { ReactNode } from "react";

/**
 * Page heading: the English title on the left and, on the same baseline,
 * an Urdu counterpart or a quiet detail on the right.
 */
export default function PageTitle({ children, urdu, aside }: { children: ReactNode; urdu?: string; aside?: ReactNode }) {
  return (
    <header className="flex items-baseline justify-between gap-6">
      <h1
        className="text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink"
        // Bricolage Grotesque by default; the type lab swaps --site-title.
        style={{ fontFamily: "var(--site-title, var(--font-bricolage))", fontVariationSettings: '"opsz" 48', fontSynthesis: "none" }}
      >
        {children}
      </h1>
      {urdu ? (
        <p dir="rtl" lang="ur" className="shrink-0 text-[30px] font-bold leading-none" style={{ fontFamily: "var(--site-script, var(--font-kufi))" }}>
          {urdu}
        </p>
      ) : (
        aside && <p className="tnum shrink-0 text-[13px] text-ink-3">{aside}</p>
      )}
    </header>
  );
}
