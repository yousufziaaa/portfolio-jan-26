"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/site/Shell";
import Home from "@/components/home/Landing";
import { PATTERN, PATTERN_NAMES, type Section } from "@/components/site/palette";

/**
 * Type lab: the real home page in the real shell, with a toolbar that swaps
 * the Latin face, the Urdu script and the section ground.
 */

const FONTS = [
  { id: "geist", label: "Geist", css: "var(--font-geist)" },
  { id: "inter", label: "Inter", css: "var(--font-inter)" },
  { id: "instrument", label: "Instrument Sans", css: "var(--font-instrument-sans)" },
  { id: "kufi", label: "Reem Kufi", css: "var(--font-kufi)" },
  { id: "machina", label: "Neue Machina", css: "var(--font-neue-machina)" },
] as const;

const TITLES = [
  { id: "bricolage", label: "Bricolage", css: "var(--font-bricolage)" },
  { id: "fraunces", label: "Fraunces", css: "var(--font-fraunces)" },
  { id: "gloock", label: "Gloock", css: "var(--font-gloock)" },
  { id: "kufi", label: "Reem Kufi", css: "var(--font-kufi)" },
  { id: "serif", label: "Instrument Serif", css: "var(--font-serif)" },
  { id: "geist", label: "Geist", css: "var(--font-geist)" },
] as const;

const SCRIPTS = [
  { id: "kufi", label: "Kufic", css: "var(--font-kufi)" },
  { id: "nastaliq", label: "Nastaliq", css: "var(--font-nastaliq)" },
] as const;

const GROUNDS: { id: Section; label: string }[] = [
  { id: "work", label: "Green" },
  { id: "writing", label: "Sky" },
  { id: "lab", label: "Rose" },
  { id: "about", label: "Plum" },
  { id: "case", label: "Charcoal" },
];

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

export default function TypeLab() {
  const [font, setFont] = useState<(typeof FONTS)[number]["id"]>("geist");
  const [title, setTitle] = useState<(typeof TITLES)[number]["id"]>("bricolage");
  const [script, setScript] = useState<(typeof SCRIPTS)[number]["id"]>("kufi");
  const [ground, setGround] = useState<Section>("work");
  const [pattern, setPattern] = useState<string>("auto");

  // The shell reads these custom properties; clear them when leaving.
  useEffect(() => {
    const root = document.body.style; // the font variables live on <body>
    root.setProperty("--site-font", FONTS.find((f) => f.id === font)!.css);
    root.setProperty("--site-script", SCRIPTS.find((s) => s.id === script)!.css);
    root.setProperty("--site-title", TITLES.find((t) => t.id === title)!.css);
    return () => {
      root.removeProperty("--site-font");
      root.removeProperty("--site-script");
      root.removeProperty("--site-title");
    };
  }, [font, script, title]);

  return (
    <>
      <Shell section={ground} pattern={pattern === "auto" ? PATTERN[ground] : Number(pattern)}>
        <Home />
      </Shell>
      <div className="fixed inset-x-0 bottom-7 z-30 flex justify-center px-4 font-inter text-[12px]">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/90 p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <Seg value={title} options={TITLES} onChange={setTitle} />
          <Seg value={font} options={FONTS} onChange={setFont} />
          <Seg value={script} options={SCRIPTS} onChange={setScript} />
          <Seg value={ground} options={GROUNDS} onChange={setGround} />
          <Seg
            value={pattern}
            options={[{ id: "auto", label: "Section's" }, ...PATTERN_NAMES.map((n, i) => ({ id: String(i), label: n }))]}
            onChange={setPattern}
          />
        </div>
      </div>
    </>
  );
}
