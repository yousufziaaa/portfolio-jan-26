"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * Concentric rings of text, each rotating at its own speed. Whichever word
 * passes the read head at 12 o'clock is lit in the accent colour.
 *
 * Characters are placed one by one around each circle, so the layout is
 * deterministic and server-renders; the client only updates two attributes
 * per frame (a ring rotation and, occasionally, which word is lit).
 */

export type Ring = {
  words: string[];
  radius: number;
  fontSize: number;
  /** Degrees per second. Negative spins anticlockwise. */
  speed: number;
  /** Fill for unlit characters. */
  color: string;
};

type Glyph = { c: string; angle: number; occ: number };

const SEPARATOR = " · ";
/** Departure Mono advance (0.636em) plus a little tracking. */
const ADVANCE = 0.66;

function layoutRing(ring: Ring) {
  const slots = Math.floor((2 * Math.PI * ring.radius) / (ring.fontSize * ADVANCE));
  const chars: { c: string; occ: number }[] = [];
  let occ = 0;
  for (let i = 0; ; i++) {
    const word = ring.words[i % ring.words.length];
    if (chars.length + word.length + SEPARATOR.length > slots) break;
    for (const c of word) chars.push({ c, occ });
    for (const c of SEPARATOR) chars.push({ c, occ: -1 });
    occ++;
  }
  const step = 360 / chars.length;
  const glyphs: Glyph[] = chars.map((ch, i) => ({ ...ch, angle: i * step }));
  return { glyphs, step, occurrences: occ };
}

export default function SpiralText({
  rings,
  size,
  accent = "var(--signal)",
  children,
  className,
}: {
  rings: Ring[];
  size: number;
  accent?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const layouts = useMemo(() => rings.map(layoutRing), [rings]);
  const ringRefs = useRef<(SVGGElement | null)[]>([]);
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const rot = rings.map(() => 0);
    const lit = rings.map(() => -2);
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const occAt = (r: number) => {
      const { glyphs, step } = layouts[r];
      const n = glyphs.length;
      const top = (((-rot[r]) % 360) + 360) % 360;
      const i = Math.round(top / step) % n;
      for (let d = 0; d < 8; d++) {
        const a = glyphs[(i + d) % n].occ;
        if (a >= 0) return a;
        const b = glyphs[(i - d + n) % n].occ;
        if (b >= 0) return b;
      }
      return -1;
    };

    const render = () => {
      rings.forEach((_, r) => {
        const g = ringRefs.current[r];
        if (!g) return;
        g.setAttribute("transform", `rotate(${rot[r].toFixed(3)})`);
        const o = occAt(r);
        if (o !== lit[r]) {
          g.querySelector(`[data-occ="${lit[r]}"]`)?.removeAttribute("data-lit");
          g.querySelector(`[data-occ="${o}"]`)?.setAttribute("data-lit", "");
          lit[r] = o;
        }
      });
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      rings.forEach((ring, r) => { rot[r] = (rot[r] + ring.speed * dt) % 360; });
      render();
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches || !visible) { render(); return; }
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; play(); });
    io.observe(root);
    reduce.addEventListener("change", play);
    play();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      reduce.removeEventListener("change", play);
    };
  }, [rings, layouts]);

  const half = size / 2;

  return (
    <div className={`relative ${className ?? ""}`} style={{ width: "100%", maxWidth: size, aspectRatio: "1", containerType: "inline-size" }}>
      <svg
        ref={rootRef}
        viewBox={`${-half} ${-half} ${size} ${size}`}
        className="spiral absolute inset-0 h-full w-full select-none font-departure-mono"
        style={{ ["--spiral-accent" as string]: accent }}
        aria-hidden
      >
        {/* Read head */}
        <path
          d={`M -4 ${-half + 2} L 4 ${-half + 2} L 0 ${-half + 9} Z`}
          fill={accent}
        />
        {layouts.map(({ glyphs }, r) => {
          const ring = rings[r];
          const byOcc = new Map<number, Glyph[]>();
          const seps: Glyph[] = [];
          glyphs.forEach((g) => {
            if (g.c === " ") return;
            if (g.occ < 0) seps.push(g);
            else byOcc.set(g.occ, [...(byOcc.get(g.occ) ?? []), g]);
          });
          const glyph = (g: Glyph, k: number) => (
            <text
              key={k}
              transform={`rotate(${g.angle.toFixed(3)}) translate(0 ${-ring.radius})`}
              textAnchor="middle"
            >
              {g.c}
            </text>
          );
          return (
            <g key={r} ref={(el) => { ringRefs.current[r] = el; }} fontSize={ring.fontSize} style={{ fill: ring.color }}>
              {seps.map(glyph)}
              {[...byOcc.entries()].map(([occ, gs]) => (
                <g key={occ} data-occ={occ} className="spiral-word">
                  {gs.map(glyph)}
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
      )}
    </div>
  );
}
