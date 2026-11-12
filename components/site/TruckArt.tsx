"use client";

import { useEffect, useRef } from "react";
import { StarMark } from "@/components/site/Ornament";
import { clink } from "@/components/site/sound";

/**
 * Truck-art trim for the top and bottom of every page.
 *
 *  - Jhalar: the fringe of chains and pendants that hangs off a truck's
 *    front. Each pendant is a small pendulum: the cursor moving through
 *    pushes the ones nearby, neighbours knock into each other, and
 *    scrolling swings the whole row.
 *  - Bumper: the painted back panel, carrying the classic line
 *    «دیکھ مگر پیار سے», "look, but with love".
 */

const COLOURS = ["#d9432b", "#ef9a2a", "#ffe066", "#2f4fd1", "#ff8fc1", "#1f7a46"];
const COUNT = 170; // enough pendants for a 2700px-wide screen; extras are clipped
const PITCH = 16;
// The black of the rail and bumper, and the bumper's pinstripes. Bands
// carry their colour in data-edge so the browser chrome can match them
// when they meet the screen edge (components/site/Edges.tsx).
const BLACK = "#121212";
const STRIPES = ["#d9432b", "#ffe066", "#1f7a46"];

// Pendant shapes, each drawn in a 10x12 box hanging from its top centre.
function Pendant({ kind, colour }: { kind: number; colour: string }) {
  if (kind === 0)
    return <path d="M5 0 C9 5 9 9 5 12 C1 9 1 5 5 0 Z" fill={colour} />; // teardrop
  if (kind === 1) return <path d="M5 0 L9.5 6 L5 12 L0.5 6 Z" fill={colour} />; // diamond
  return (
    <>
      <circle cx="5" cy="3.5" r="3.2" fill={colour} />
      <path d="M2 7 h6 l-3 5 z" fill={colour} />
    </>
  ); // bead and bell
}

// Deterministic per-pendant randomness (integer hash, so server and client
// agree): 0..1 for pendant i and a salt.
function rnd(i: number, salt = 0) {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 7, 40503);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}
const chainOf = (i: number) => 5 + Math.floor(rnd(i, 1) * 11); // 5-15px
const PENDANT_W = 12;

export function Jhalar() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const armRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Each pendant is its own pendulum: length to the middle of the
    // pendant, a weight, and a little damping, all slightly different, so
    // a breeze scatters them out of step and they knock together.
    const len = Array.from({ length: COUNT }, (_, i) => chainOf(i) + 7);
    const mass = Array.from({ length: COUNT }, (_, i) => 0.6 + rnd(i, 2) * 1.0 + (i % 3 === 2 ? 0.3 : 0));
    const damp = Array.from({ length: COUNT }, (_, i) => 0.35 + rnd(i, 3) * 0.5);
    const catchWind = Array.from({ length: COUNT }, (_, i) => 0.25 + rnd(i, 4) * 1.7);
    const th = new Float32Array(COUNT);
    const om = new Float32Array(COUNT);
    const G = 1500; // px/s^2, tuned by eye
    const MAX = 0.9; // ~52 degrees
    const E = 0.75; // restitution when two pendants hit

    let raf = 0;
    let last = 0;
    const kick = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      let energy = 0;
      for (let i = 0; i < COUNT; i++) {
        om[i] += (-(G / len[i]) * Math.sin(th[i]) - damp[i] * om[i]) * dt;
        th[i] = Math.max(-MAX, Math.min(MAX, th[i] + om[i] * dt));
      }
      // Neighbours knock together when their pendants meet: a lossy,
      // weight-aware bounce, a nudge apart, and a clink.
      for (let i = 0; i < COUNT - 1; i++) {
        const xa = len[i] * Math.sin(th[i]);
        const xb = PITCH + len[i + 1] * Math.sin(th[i + 1]);
        const overlap = PENDANT_W - (xb - xa);
        if (overlap > 0) {
          const ca = len[i] * Math.cos(th[i]);
          const cb = len[i + 1] * Math.cos(th[i + 1]);
          const va = om[i] * ca;
          const vb = om[i + 1] * cb;
          if (va > vb) {
            const ma = mass[i];
            const mb = mass[i + 1];
            const p = ma * va + mb * vb;
            om[i] = (p - mb * E * (va - vb)) / (ma + mb) / ca;
            om[i + 1] = (p + ma * E * (va - vb)) / (ma + mb) / cb;
            if (va - vb > 25) clink(i, (va - vb) / 500);
          }
          th[i] -= overlap / 2 / len[i];
          th[i + 1] += overlap / 2 / len[i + 1];
        }
      }
      for (let i = 0; i < COUNT; i++) {
        energy += Math.abs(th[i]) + Math.abs(om[i]) * 0.1;
        const el = armRefs.current[i];
        // CSS rotates clockwise, which swings a hanging tip left; the physics
        // treats positive as right, so flip the sign.
        if (el) el.style.transform = `rotate(${-th[i]}rad)`;
      }
      if (energy > 0.02) raf = requestAnimationFrame(tick);
      else {
        th.fill(0);
        om.fill(0);
        armRefs.current.forEach((el) => el && (el.style.transform = ""));
        raf = 0;
      }
    };

    // The cursor is a breeze: pendants near it get pushed along its direction.
    let px = -1;
    let pt = 0;
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const t = performance.now();
      if (px >= 0 && t - pt < 100) {
        const vx = (x - px) / Math.max(1, t - pt); // px per ms
        const lo = Math.max(0, Math.floor((Math.min(x, px) - 26) / PITCH));
        const hi = Math.min(COUNT - 1, Math.ceil((Math.max(x, px) + 26) / PITCH));
        for (let i = lo; i <= hi; i++) {
          const d = Math.abs(i * PITCH + PITCH / 2 - x);
          const fall = Math.max(0, 1 - d / 26);
          om[i] += (Math.max(-7, Math.min(7, vx * 4)) * fall * catchWind[i]) / mass[i];
        }
        kick();
      }
      px = x;
      pt = t;
    };
    const onLeave = () => (px = -1);

    // Scrolling swings the whole row, like a truck pulling away.
    let lastY = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const push = Math.max(-5, Math.min(5, -dy * 0.06));
      for (let i = 0; i < COUNT; i++) om[i] += (push * catchWind[i]) / mass[i];
      kick();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="relative h-[36px] shrink-0 overflow-hidden">
      {/* The rail: a black band picked out with cream dots. */}
      <div
        data-edge={BLACK}
        className="absolute inset-x-0 top-0 h-[6px]"
        style={{
          backgroundColor: BLACK,
          backgroundImage: "radial-gradient(#f5f0e4 1.4px, transparent 1.6px)",
          backgroundSize: "8px 6px",
        }}
      />
      <div className="absolute left-0 top-[6px] flex">
        {Array.from({ length: COUNT }, (_, i) => {
          const chain = chainOf(i);
          return (
            <span
              key={i}
              ref={(el) => {
                armRefs.current[i] = el;
              }}
              className="block origin-top"
              style={{ width: PITCH }}
            >
              {/* A slow sway of its own, under the physics. */}
              <span className="jhalar-sway block origin-top" style={{ animationDelay: `${(-i * 0.37) % 4}s` }}>
                <svg width={PITCH} height={chain + 12} viewBox={`0 0 ${PITCH} ${chain + 12}`} className="block">
                  <line x1={PITCH / 2} y1="0" x2={PITCH / 2} y2={chain} stroke="#121212" strokeWidth="1" strokeDasharray="2 1" />
                  <g transform={`translate(${PITCH / 2 - 5} ${chain})`}>
                    <Pendant kind={i % 3} colour={COLOURS[i % COLOURS.length]} />
                  </g>
                </svg>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Bumper() {
  return (
    <div className="shrink-0">
      {/* Painted pinstripes. */}
      {STRIPES.map((c) => (
        <div key={c} data-edge={c} className="h-[3px]" style={{ backgroundColor: c }} />
      ))}
      <div
        data-edge={BLACK}
        className="relative flex h-[58px] items-center justify-center gap-4 overflow-hidden"
        style={{
          backgroundColor: BLACK,
          backgroundImage:
            "radial-gradient(#f5f0e4 1.3px, transparent 1.5px), radial-gradient(#f5f0e4 1.3px, transparent 1.5px)",
          backgroundSize: "10px 6px, 10px 6px",
          backgroundPosition: "0 3px, 0 calc(100% - 3px)",
          backgroundRepeat: "repeat-x, repeat-x",
        }}
      >
        <span className="flex gap-1.5" aria-hidden>
          <StarMark colour="#ff8fc1" size={10} />
          <StarMark colour="#ffe066" size={10} />
          <StarMark colour="#9fdcff" size={10} />
        </span>
        <p
          lang="ur"
          dir="rtl"
          title="Look, but with love"
          className="text-[22px] leading-none text-[#ffd23f]"
          style={{ fontFamily: "var(--font-nastaliq)", transform: "translateY(-3px)" }}
        >
          دیکھ مگر پیار سے
          <span className="sr-only" lang="en" dir="ltr">
            {" "}
            (look, but with love)
          </span>
        </p>
        <span className="flex gap-1.5" aria-hidden>
          <StarMark colour="#9fdcff" size={10} />
          <StarMark colour="#ffe066" size={10} />
          <StarMark colour="#ff8fc1" size={10} />
        </span>
      </div>
    </div>
  );
}
