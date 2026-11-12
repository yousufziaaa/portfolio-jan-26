"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AsciiField, { type FieldMode } from "@/components/design-lab/AsciiField";
import { links, visibleWork } from "@/data/work";

/**
 * Throwaway comparison page: the same narrow column over three ideas for
 * where the ASCII lives, in four candidate fonts.
 */

const FONTS = [
  { id: "inter", label: "Inter", css: "var(--font-inter)" },
  { id: "geist", label: "Geist", css: "var(--font-geist)" },
  { id: "instrument", label: "Instrument Sans", css: "var(--font-instrument-sans)" },
  { id: "machina", label: "Neue Machina", css: "var(--font-neue-machina)" },
] as const;

const MODES: { id: FieldMode; label: string; hint: string }[] = [
  { id: "light", label: "1 · Light", hint: "Sun through blinds, by time of day" },
  { id: "hover", label: "2 · Hover", hint: "Hover a project or an off-hours phrase" },
  { id: "margins", label: "3 · Margins", hint: "Photos down the margins, scroll to see parallax" },
];

const PROJECT: Record<string, { src: string; colour: string }> = {
  groq: { src: "/groq-hero.png", colour: "#e2452b" },
  phia: { src: "/phia-hero.png", colour: "#2f4fd1" },
  klarify: { src: "/klarify-hero.png", colour: "#2f8a4c" },
};

const OFF_HOURS = [
  { text: "cooking for friends", src: "/kitchen.JPG", colour: "#e2452b" },
  { text: "at a board game night", src: "/board-games.jpg", colour: "#2f4fd1" },
  { text: "behind a camera", src: "/camera.JPG", colour: "#ef7b22" },
  { text: "somewhere new", src: "/exploring.JPG", colour: "#2f8a4c" },
];

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-black/[0.04] p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3 py-1 transition-colors duration-150 ease-out ${
            value === o.id ? "bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-ink-3 hover:text-ink-2"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Lab() {
  const columnRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FieldMode>("light");
  const [font, setFont] = useState<(typeof FONTS)[number]["id"]>("geist");
  const [hour, setHour] = useState(16);
  const [hover, setHover] = useState<{ src: string; colour: string } | null>(null);

  useEffect(() => {
    const d = new Date();
    setHour(d.getHours() + d.getMinutes() / 60);
  }, []);

  const fontCss = FONTS.find((f) => f.id === font)!.css;
  const on = (h: { src: string; colour: string }) => ({
    onMouseEnter: () => setHover(h),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(h),
    onBlur: () => setHover(null),
  });

  return (
    <main className="relative isolate min-h-[200svh] bg-paper text-ink antialiased" style={{ fontFamily: fontCss }}>
      <AsciiField
        mode={mode}
        hour={hour}
        image={mode === "hover" ? hover?.src ?? null : null}
        colour={hover?.colour ?? "#e2452b"}
        marginImages={["/kitchen.JPG", "/camera.JPG"]}
        columnRef={columnRef}
      />

      <div ref={columnRef} className="mx-auto max-w-[520px] px-6 pb-40 pt-16 md:pt-[14vh]">
        <header className="text-[15px] leading-6">
          <p className="font-medium tracking-[-0.01em]">Yousuf Zia</p>
          <p className="text-ink-3">Product designer and engineer</p>
        </header>

        <p className="mt-8 text-[15px] leading-[1.65] text-ink-2">
          Now at <span className="text-ink">Latent</span>. Previously at <span className="text-ink">Nvidia</span>, and
          at{" "}
          <span className="cursor-default text-ink" {...on(PROJECT.groq)}>
            Groq
          </span>
          , where I built the GroqCloud design system from the ground up. Before that, growth at{" "}
          <span className="cursor-default text-ink" {...on(PROJECT.phia)}>
            Phia
          </span>{" "}
          and every flow of{" "}
          <span className="cursor-default text-ink" {...on(PROJECT.klarify)}>
            Klarify
          </span>
          .
        </p>

        <p className="mt-5 text-[15px] leading-[1.65] text-ink-2">
          Off-hours I&apos;m usually{" "}
          {OFF_HOURS.map((o, i) => (
            <span key={o.text}>
              <span
                tabIndex={0}
                className="cursor-default text-ink underline decoration-rule decoration-1 underline-offset-[5px] outline-none"
                {...on(o)}
              >
                {o.text}
              </span>
              {i < OFF_HOURS.length - 2 ? ", " : i === OFF_HOURS.length - 2 ? ", or " : "."}
            </span>
          ))}
        </p>

        <section className="mt-14">
          <p className="mb-3 text-[13px] text-ink-3">Selected work</p>
          <ul className="border-t border-rule">
            {visibleWork.map((w) => (
              <li key={w.slug} className="border-b border-rule">
                <Link
                  href={`/projects/${w.slug}`}
                  {...on(PROJECT[w.slug])}
                  className="group flex items-baseline justify-between gap-4 py-3 text-[15px] outline-none"
                >
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
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-rule bg-white/85 p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <Seg value={mode} options={MODES} onChange={setMode} />
          <Seg value={font} options={FONTS.map((f) => ({ id: f.id, label: f.label }))} onChange={setFont} />
          {mode === "light" && (
            <label className="flex items-center gap-2 px-2 text-ink-3">
              <span className="tnum w-10">
                {String(Math.floor(hour)).padStart(2, "0")}:{String(Math.floor((hour % 1) * 60)).padStart(2, "0")}
              </span>
              <input
                type="range"
                min={0}
                max={23.99}
                step={0.05}
                value={hour}
                onChange={(e) => setHour(parseFloat(e.target.value))}
                className="w-28 accent-ink"
                aria-label="Time of day"
              />
            </label>
          )}
          <span className="hidden px-2 text-ink-3 lg:inline">{MODES.find((m) => m.id === mode)!.hint}</span>
        </div>
      </div>
    </main>
  );
}
