"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A photo re-drawn as ASCII on a coloured poster, with a big caption — the
 * one bit of "furniture" on an otherwise plain page. Click to swap posters.
 *
 * The photo is fetched through Next's image optimiser (small, same-origin,
 * so the canvas isn't tainted), sampled one cell per character, and each
 * cell's brightness picks a glyph from a density ramp.
 */

export type Poster = {
  src: string;
  caption: string;
  subject: string;
  /** Poster colour, glyph colour, and the colour for the brightest glyphs. */
  bg: string;
  ink: string;
  highlight: string;
  /** Colour for the caption and corner labels. Defaults to `highlight`. */
  text?: string;
  /** Light posters map dark pixels to dense glyphs. */
  light?: boolean;
};

const RAMP = " .-:=+*x#%@";
const CELL_W = 8.4;
const CELL_H = 14;

type Grid = { cols: number; rows: number; lum: Float32Array; seed: Float32Array };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=384&q=70`;
  });
}

function sample(img: HTMLImageElement, cols: number, rows: number): Grid {
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  // object-fit: cover, accounting for cells being taller than wide.
  const target = (cols * CELL_W) / (rows * CELL_H);
  const ratio = img.width / img.height;
  let sw = img.width, sh = img.height, sx = 0, sy = 0;
  if (ratio > target) { sw = img.height * target; sx = (img.width - sw) / 2; }
  else { sh = img.width / target; sy = (img.height - sh) / 2; }
  x.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
  const d = x.getImageData(0, 0, cols, rows).data;
  const lum = new Float32Array(cols * rows);
  const seed = new Float32Array(cols * rows);
  let min = 1, max = 0;
  for (let i = 0; i < lum.length; i++) {
    const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    lum[i] = l;
    seed[i] = Math.random();
    min = Math.min(min, l);
    max = Math.max(max, l);
  }
  // Stretch contrast so every photo uses the whole ramp, then push the
  // midtones apart so a subject separates from its background.
  for (let i = 0; i < lum.length; i++) {
    const n = (lum[i] - min) / Math.max(0.001, max - min);
    lum[i] = n * n * (3 - 2 * n);
  }
  return { cols, rows, lum, seed };
}

export default function AsciiPoster({
  posters,
  className,
  aspect = "4 / 5",
}: {
  posters: Poster[];
  className?: string;
  /** CSS aspect-ratio of the poster. */
  aspect?: string;
}) {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const grid = useRef<Grid | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reveal = useRef(1);
  const raf = useRef(0);
  const poster = posters[index];
  const text = poster.text ?? poster.highlight;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const g = grid.current;
    if (!canvas || !g) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = canvas.width / canvas.clientWidth;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const family = getComputedStyle(document.body).getPropertyValue("--font-departure-mono").trim() || "monospace";
    ctx.font = `${CELL_H * 0.92}px ${family}`;
    ctx.textBaseline = "top";
    const p = pointer.current;
    const shownRows = Math.floor(g.rows * reveal.current);
    // Keep a clear margin under the corner labels and a clear band for the
    // caption, like the white space on a printed poster.
    const top = 3;
    const bottom = Math.floor(g.rows * 0.76);
    for (let r = 0; r < g.rows; r++) {
      const band = r >= shownRows && r < shownRows + 3;
      if (r >= shownRows && !band) break;
      if (r < top || r >= bottom) continue;
      for (let c = 2; c < g.cols - 2; c++) {
        const i = r * g.cols + c;
        let l = g.lum[i];
        if (poster.light) l = 1 - l;
        // Leave the darkest areas empty so the image sits on the poster
        // instead of filling it edge to edge.
        if (l < 0.3) continue;
        let k = Math.min(RAMP.length - 1, Math.floor(l * RAMP.length));
        let colour = l > 0.88 || g.seed[i] > 0.985 ? poster.highlight : poster.ink;
        const near = p && Math.hypot(c - p.x, (r - p.y) * (CELL_H / CELL_W)) < 4.5;
        if (band || near) {
          k = 1 + Math.floor(Math.random() * (RAMP.length - 1));
          colour = poster.highlight;
        }
        if (RAMP[k] === " ") continue;
        ctx.fillStyle = colour;
        ctx.fillText(RAMP[k], c * CELL_W, r * CELL_H);
      }
    }
  }, [poster]);

  // Size the canvas to its box and resample the photo whenever the poster
  // or the box size changes.
  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    let cancelled = false;
    let img: HTMLImageElement | null = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const layout = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      if (img && w > CELL_W && h > CELL_H) grid.current = sample(img, Math.floor(w / CELL_W), Math.floor(h / CELL_H));
      draw();
    };

    loadImage(poster.src).then((loaded) => {
      if (cancelled) return;
      img = loaded;
      layout();
      if (reduce) return;
      reveal.current = 0;
      const start = performance.now();
      const step = (now: number) => {
        reveal.current = Math.min(1, (now - start) / 900);
        draw();
        if (reveal.current < 1) raf.current = requestAnimationFrame(step);
      };
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(step);
    });

    const ro = new ResizeObserver(layout);
    ro.observe(box);
    return () => {
      cancelled = true;
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [poster, draw]);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current = { x: (e.clientX - rect.left) / CELL_W, y: (e.clientY - rect.top) / CELL_H };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(draw);
  };
  const onLeave = () => {
    pointer.current = null;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(draw);
  };

  const next = posters[(index + 1) % posters.length];

  return (
    <figure className={className}>
      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % posters.length)}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        aria-label={`Next poster: ${next.caption}`}
        className="group relative block w-full overflow-hidden rounded-[3px] text-left outline-none transition-[background-color,transform] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-4 focus-visible:ring-offset-paper active:scale-[0.99]"
        style={{ background: poster.bg, aspectRatio: aspect, containerType: "inline-size" }}
      >
        <div ref={boxRef} className="absolute inset-0">
          <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
        </div>
        <span
          className="absolute left-5 top-4 font-departure-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ color: text }}
        >
          fig. {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="absolute right-5 top-4 font-departure-mono text-[11px] uppercase tracking-[0.12em]"
          style={{ color: text }}
        >
          {poster.subject}
        </span>
        <span
          className="absolute bottom-4 left-5 right-16 font-inter text-[clamp(18px,5.5cqw,36px)] font-medium leading-[1] tracking-[-0.03em]"
          style={{ color: text }}
        >
          {poster.caption}
        </span>
        <span
          className="absolute bottom-5 right-5 font-departure-mono text-[11px] tracking-[0.12em] opacity-70 transition-opacity duration-150 group-hover:opacity-100"
          style={{ color: text }}
        >
          {index + 1}/{posters.length}
        </span>
      </button>
      <figcaption className="sr-only">
        ASCII rendering of a photo: {poster.caption}. Press to see the next one.
      </figcaption>
    </figure>
  );
}
