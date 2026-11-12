"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import GeoField from "@/components/site/GeoField";
import { StarMark, TruckHem } from "@/components/site/Ornament";
import { links, visibleWork } from "@/data/work";

/**
 * Throwaway comparison: the same narrow column in three readings of
 * Islamic geometry and South Asian truck art.
 *
 *  1 Lattice: star pattern in ASCII strokes behind the page, quiet.
 *  2 Plate:   one printed plate of coloured tilework in the column.
 *  3 Poster:  a flat saturated ground with a halftone screen, the name in
 *             large calligraphy, a truck-art hem.
 *  4 Both:    the poster, with the lattice woven into the ground tone on tone.
 */

type Direction = "lattice" | "plate" | "poster" | "both";

const DIRECTIONS: { id: Direction; label: string; hint: string }[] = [
  { id: "lattice", label: "1 · Lattice", hint: "Reload to watch it construct. Hover a project." },
  { id: "plate", label: "2 · Plate", hint: "Hover a project to re-lay the tiles" },
  { id: "poster", label: "3 · Poster", hint: "Try the grounds" },
  { id: "both", label: "4 · Both", hint: "Poster ground with the lattice woven in, tone on tone" },
];

const FONTS = [
  { id: "geist", label: "Geist", css: "var(--font-geist)" },
  { id: "instrument", label: "Instrument Sans", css: "var(--font-instrument-sans)" },
  { id: "kufi", label: "Reem Kufi", css: "var(--font-kufi)" },
  { id: "machina", label: "Neue Machina", css: "var(--font-neue-machina)" },
] as const;

const SCRIPTS = [
  { id: "kufi", label: "Kufic", css: "var(--font-kufi)" },
  { id: "nastaliq", label: "Nastaliq", css: "var(--font-nastaliq)" },
] as const;

// Grounds lifted from the reference posters, deepened a touch so cream
// body text stays readable (about 3.7:1).
const GROUNDS = [
  { id: "green", label: "Green", bg: "#368c53", ink: "#f5f0e4", script: "#f5f0e4", dot: "rgba(0,0,0,0.13)", lattice: "#2a7344" },
  { id: "rose", label: "Rose", bg: "#cf4a7d", ink: "#fff4ea", script: "#fff4ea", dot: "rgba(0,0,0,0.11)", lattice: "#ad3866" },
  { id: "sky", label: "Sky", bg: "#b5d3f4", ink: "#5c1c35", script: "#5c1c35", dot: "rgba(92,28,53,0.10)", lattice: "#86ade0" },
] as const;

const PROJECT_COLOUR: Record<string, string> = {
  groq: "#d9432b",
  phia: "#2f4fd1",
  klarify: "#1f7a46",
};

const NAME_UR = "یوسف ضیاء";

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-black/[0.05] p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 transition-colors duration-150 ease-out ${
            value === o.id ? "bg-white text-[#121212] shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-[#5b5b59] hover:text-[#121212]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function GeoLab() {
  const columnRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState<Direction>("both");
  const [font, setFont] = useState<(typeof FONTS)[number]["id"]>("geist");
  const [script, setScript] = useState<(typeof SCRIPTS)[number]["id"]>("kufi");
  const [groundId, setGroundId] = useState<(typeof GROUNDS)[number]["id"]>("green");
  const [hover, setHover] = useState<string | null>(null);

  const ground = GROUNDS.find((g) => g.id === groundId)!;
  const poster = dir === "poster" || dir === "both";
  const both = dir === "both";
  const fontCss = FONTS.find((f) => f.id === font)!.css;
  const scriptCss = SCRIPTS.find((s) => s.id === script)!.css;

  // In poster mode the greys turn into tints of the ground's ink.
  const vars = (
    poster
      ? {
          "--ink": ground.ink,
          "--ink-2": `color-mix(in srgb, ${ground.ink} 92%, transparent)`,
          "--ink-3": `color-mix(in srgb, ${ground.ink} 76%, transparent)`,
          "--rule": `color-mix(in srgb, ${ground.ink} 30%, transparent)`,
          backgroundColor: ground.bg,
          backgroundImage: `radial-gradient(${ground.dot} 0.9px, transparent 1.3px)`,
          backgroundSize: "4px 4px",
        }
      : { backgroundColor: "var(--paper)" }
  ) as CSSProperties;

  const on = (slug: string) => ({
    onMouseEnter: () => setHover(slug),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(slug),
    onBlur: () => setHover(null),
  });

  return (
    <main
      className="relative isolate min-h-[160svh] text-ink antialiased transition-[background-color] duration-300 ease-out"
      style={{ ...vars, fontFamily: fontCss }}
    >
      {dir !== "poster" && (
        <GeoField
          mode={dir === "plate" ? "plate" : "lattice"}
          ink={both ? ground.lattice : undefined}
          colour={both ? ground.script : PROJECT_COLOUR[hover ?? ""] ?? "#d9432b"}
          tint={!!hover}
          columnRef={columnRef}
          plateRef={plateRef}
        />
      )}
      {poster && <TruckHem />}

      <div ref={columnRef} className="mx-auto max-w-[520px] px-6 pb-40 pt-16 md:pt-[14vh]">
        {poster ? (
          <header style={{ containerType: "inline-size" }}>
            <p
              dir="rtl"
              lang="ur"
              className="whitespace-nowrap text-right"
              style={{
                fontFamily: scriptCss,
                color: ground.script,
                fontWeight: script === "kufi" ? 700 : 500,
                fontSize: script === "kufi" ? "22cqw" : "17cqw",
                lineHeight: script === "kufi" ? 1.15 : 1.9,
              }}
            >
              {NAME_UR}
            </p>
            <p className="mt-2 text-[28px] font-medium leading-[1.05] tracking-[-0.02em]">Yousuf Zia</p>
          </header>
        ) : (
          <header className="flex items-baseline justify-between text-[15px] leading-6">
            <div>
              <p className="font-medium tracking-[-0.01em]">Yousuf Zia</p>
              <p className="text-ink-3">Product designer and engineer</p>
            </div>
            <p dir="rtl" lang="ur" className="text-[20px] text-ink-3" style={{ fontFamily: scriptCss }}>
              {NAME_UR}
            </p>
          </header>
        )}

        <p className="mt-8 text-[15px] leading-[1.65] text-ink-2">
          Now at <span className="text-ink">Latent</span>. Previously at <span className="text-ink">Nvidia</span>, and
          at <span className="text-ink">Groq</span>, where I built the GroqCloud design system from the ground up.
          Before that, growth at <span className="text-ink">Phia</span> and every flow of{" "}
          <span className="text-ink">Klarify</span>.
        </p>

        {dir === "plate" && <div ref={plateRef} aria-hidden className="mt-12 aspect-[16/11] w-full" />}

        <section className="mt-14">
          <p className="mb-3 text-[13px] text-ink-3">Selected work</p>
          <ul className="border-t border-rule">
            {visibleWork.map((w) => (
              <li key={w.slug} className="border-b border-rule">
                <Link
                  href={`/projects/${w.slug}`}
                  {...on(w.slug)}
                  className="group grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-2 py-3 text-[15px] outline-none"
                >
                  <span className="transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45">
                    <StarMark colour={poster ? ground.ink : PROJECT_COLOUR[w.slug] ?? "var(--ink-3)"} />
                  </span>
                  <span className="truncate">
                    <span className="text-ink">{w.title}</span>
                    <span className="text-ink-3"> {w.role}</span>
                  </span>
                  <span className="tnum text-[13px] text-ink-3">{w.dateRange}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-ink-2 underline decoration-rule decoration-1 underline-offset-[5px] hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Lab controls */}
      <div className="fixed inset-x-0 bottom-4 z-10 flex justify-center px-4 font-inter text-[12px]">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/85 p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <Seg value={dir} options={DIRECTIONS} onChange={setDir} />
          <Seg value={font} options={FONTS} onChange={setFont} />
          <Seg value={script} options={SCRIPTS} onChange={setScript} />
          {poster && <Seg value={groundId} options={GROUNDS} onChange={setGroundId} />}
          <span className="hidden px-2 text-[#8e8e8b] xl:inline">{DIRECTIONS.find((d) => d.id === dir)!.hint}</span>
        </div>
      </div>
    </main>
  );
}
