// Builds the favicon set and the Open Graph card from the site's own parts:
// the poster green, the eight-pointed star, the ASCII star-and-cross lattice,
// the jhalar fringe and the painted bumper.
//
//   node scripts/brand.mjs            write into app/ and public/
//   node scripts/brand.mjs <dir>      write everything into <dir> to review
//
// Everything is drawn as SVG and rasterised by sharp. Text is shaped by
// HarfBuzz's hb-view (brew install harfbuzz) straight from the files in
// fonts/ and inlined as glyph paths. sharp's own text goes through CoreText
// on macOS, which can't see those files; hb-view gets the Urdu joins and
// the variable axes right.
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const root = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const outDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
const target = (rel) => (outDir ? path.join(outDir, path.basename(rel)) : path.join(root, rel));
if (outDir) await mkdir(outDir, { recursive: true });

// From components/site/palette.ts and TruckArt.tsx.
const GROUND = "#368c53";
const CREAM = "#f5f0e4";
const LATTICE = "#2a7344";
const INK = "#121212";
const COMPANY = { latent: "#c3a6ff", nvidia: "#8cc63f", groq: "#f5603f", phia: "#7d9cff", klarify: "#f2a27e" };
const FRINGE = ["#d9432b", "#ef9a2a", "#ffe066", "#2f4fd1", "#ff8fc1", "#1f7a46"];

/** Eight-pointed star centred on (cx, cy); same proportions as StarMark. */
function star(cx, cy, r, inner = 0.52) {
  return Array.from({ length: 16 }, (_, i) => {
    const rr = i % 2 === 0 ? r : r * inner;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

// --------------------------------------------------------------------- text

const FACES = {
  title: "BricolageGrotesque-Variable.ttf",
  kufi: "ReemKufi-Variable.ttf",
  nastaliq: "NotoNastaliqUrdu-Variable.ttf",
  mono: "FragmentMono-Regular.ttf",
};
let runs = 0;

/**
 * Shape a run of text with hb-view. Returns its advance width in px and a
 * function that draws it with the baseline at (x, y). `spacing` is extra
 * tracking in px (left to right runs only).
 */
async function run(text, { face, size, axes = {}, spacing = 0 }) {
  const vars = Object.entries(axes).map(([k, v]) => `${k}=${v}`).join(",");
  const { stdout } = await promisify(execFile)("hb-view", [
    path.join(root, "fonts", FACES[face]),
    text,
    `--font-size=${size}`,
    ...(vars ? [`--variations=${vars}`] : []),
    "--margin=0",
    "--logical",
    "--output-format=svg",
  ]);
  const p = `t${runs++}-`;
  const width = +stdout.match(/<svg[^>]* width="([\d.]+)"/)[1];
  const defs = stdout.match(/<defs>([\s\S]*?)<\/defs>/)[1].replace(/id="/g, `id="${p}`);
  const uses = [...stdout.matchAll(/<use xlink:href="#([^"]+)" x="([-\d.]+)" y="([-\d.]+)"\/>/g)];
  const base = uses.length ? +uses[0][3] : 0;
  const glyphs = uses
    .map(([, id, x, y], i) => `<use href="#${p}${id}" x="${(+x + i * spacing).toFixed(2)}" y="${(+y - base).toFixed(2)}"/>`)
    .join("");
  return {
    w: width + Math.max(0, uses.length - 1) * spacing,
    // Where each glyph starts, left to right (visual order, even for RTL).
    starts: uses.map(([, , x], i) => +x + i * spacing),
    defs,
    draw: (x, y, fill, opacity = 1) =>
      `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" fill="${fill}"${
        opacity < 1 ? ` fill-opacity="${opacity}"` : ""
      }>${glyphs}</g>`,
  };
}

// ------------------------------------------------------------------ favicon

// A cream star on a green tile. The star is a touch fuller than the nav's
// so it holds at 16px; a small green eye at the centre, like a tile
// rosette, once there are enough pixels for it.
function iconSvg({ size = 64, tile = true } = {}) {
  const s = size;
  const c = s / 2;
  const ground = `<rect width="${s}" height="${s}"${tile ? ` rx="${s * 0.22}"` : ""} fill="${GROUND}"/>`;
  const r = tile ? s * 0.4 : s * 0.33;
  const eye = s > 16 ? `<circle cx="${c}" cy="${c}" r="${r * 0.16}" fill="${GROUND}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  ${ground}
  <polygon points="${star(c, c, r, 0.56)}" fill="${CREAM}"/>
  ${eye}
</svg>`;
}

/** Pack PNGs into a .ico (PNG-in-ICO, fine everywhere since Vista). */
function ico(pngs) {
  const head = Buffer.alloc(6 + pngs.length * 16);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const e = 6 + i * 16;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
}

// --------------------------------------------------------------------- card

const W = 1200;
const H = 630;
const S = 1.5; // trim scale: the site's 1x trim reads too fine in a feed

/**
 * The ASCII star-and-cross lattice, ported from GeoField's shader (pattern
 * 0, fully built). Returns each inked cell, plus the cells of the dotted
 * ring inside each star (`ring`), which only show while the hover tint
 * passes. `h` and `hr` are the shader's per-cell hashes for those.
 */
function latticeCells(clear) {
  const CW = 9;
  const CH = 15;
  const unit = 264;
  const ox = W / 2;
  const oy = H * 0.42;
  const R2 = Math.SQRT1_2;
  const box = (x, y, b) => {
    const dx = Math.abs(x) - b;
    const dy = Math.abs(y) - b;
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
  };
  const star8 = (qx, qy, b) => Math.min(box(qx, qy, b), box(R2 * qx - R2 * qy, R2 * qx + R2 * qy, b));
  const field = (px, py) => star8(px - Math.floor(px + 0.5), py - Math.floor(py + 0.5), 0.3536);
  const hash = (a, b) => {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const cells = [];
  for (let cy = 0; cy * CH < H; cy++) {
    for (let cx = 0; cx * CW < W; cx++) {
      const x = (cx + 0.5) * CW;
      const y = (cy + 0.5) * CH;
      const px = (x - ox) / unit;
      const py = (y - oy) / unit;
      const qx = px - Math.floor(px + 0.5);
      const qy = py - Math.floor(py + 0.5);
      const o = field(px, py);
      const e = 0.75 / unit;
      const tx = -(field(px, py + e) - field(px, py - e));
      const ty = field(px + e, py) - field(px - e, py);
      const ax = Math.abs(tx);
      const ay = Math.abs(ty);
      let ch;
      let half;
      if (ax > ay * 2) (ch = "-"), (half = 0.5 * CH);
      else if (ay > ax * 2) (ch = "|"), (half = 0.5 * CW);
      else (ch = tx * ty < 0 ? "/" : "\\"), (half = 0.36 * CH);
      if (Math.abs(o) * unit > half) ch = "";
      let alpha = 0.75;
      if (Math.hypot((qx * unit) / CW, (qy * unit) / CH) < 0.6) ch = "*";
      if (Math.hypot(((Math.abs(qx) - 0.5) * unit) / CW, ((Math.abs(qy) - 0.5) * unit) / CH) < 0.6) ch = "+";
      if (!ch && o * unit < -half * 1.6 && (cx + cy) % 2 === 0) (ch = "."), (alpha = 0.55);
      const ring = !ch && Math.abs(star8(qx, qy, 0.22)) * unit < 0.5 * CW;
      if (!ch && !ring) continue;
      // Keep the names clear, with a soft edge like the site's column.
      const d = Math.max(clear.x0 - x, x - clear.x1, clear.y0 - y, y - clear.y1);
      const fade = Math.min(1, Math.max(0, d / 48));
      if (fade > 0) cells.push({ ch: ch || "·", x, y, a: alpha * fade, fade, ring, h: hash(cx + 7, cy + 7), hr: hash(cx, cy) });
    }
  }
  return cells;
}

// Same hash as TruckArt, so the chains hang the same lengths as on the site.
function rnd(i, salt = 0) {
  let h = Math.imul(i + 1, 2654435761) ^ Math.imul(salt + 7, 40503);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

function pendant(kind, colour) {
  if (kind === 0) return `<path d="M5 0 C9 5 9 9 5 12 C1 9 1 5 5 0 Z" fill="${colour}"/>`;
  if (kind === 1) return `<path d="M5 0 L9.5 6 L5 12 L0.5 6 Z" fill="${colour}"/>`;
  return `<circle cx="5" cy="3.5" r="3.2" fill="${colour}"/><path d="M2 7 h6 l-3 5 z" fill="${colour}"/>`;
}

/** The fringe at time t (s), swaying like the site's .jhalar-sway. */
function jhalar(t) {
  const pitch = 16;
  const n = Math.ceil(W / S / pitch) + 1;
  const items = Array.from({ length: n }, (_, i) => {
    const chain = 5 + Math.floor(rnd(i, 1) * 11);
    const cx = i * pitch + pitch / 2;
    // ±3deg, alternating, each pendant 0.37s behind the last, like the
    // site's .jhalar-sway (2.4s there; SWAY here so the video loops).
    const tilt = (-3 * Math.cos((Math.PI * (t + ((i * 0.37) % 4))) / SWAY)).toFixed(2);
    return `<g transform="rotate(${tilt} ${cx} 6)">
      <line x1="${cx}" y1="6" x2="${cx}" y2="${6 + chain}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 1"/>
      <g transform="translate(${cx - 5} ${6 + chain})">${pendant(i % 3, FRINGE[i % FRINGE.length])}</g>
    </g>`;
  });
  return `<g transform="scale(${S})">
    <rect width="${W / S}" height="6" fill="${INK}"/>
    <rect width="${W / S}" height="6" fill="url(#rail)"/>
    ${items.join("")}
  </g>`;
}

// The video, a 12s loop:
//  - the lattice is built, and the site's hover tint sweeps across it,
//    cell by cell, once in each company's colour (2.4s apiece);
//  - the fringe sways, three full swings per loop;
//  - the Urdu is written in with a pen, held, then fades before it's
//    written again.
const LOOP = 12;
const FPS = 30;
const SWAY = 2; // half a swing, in seconds
const STILL = 5; // the moment the still image shows
const WAVES = ["latent", "nvidia", "groq", "phia", "klarify"];
const WRITE_FROM = 0.5;
const WRITE_FOR = 3.2;
const INK_FADE = [LOOP - 1.3, LOOP - 0.5];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => {
  const u = clamp01(v);
  return u * u * (3 - 2 * u);
};

/**
 * Traces a shaped run as pen strokes, so it can be drawn in like writing.
 * The run is rasterised, thinned to its centre lines (Zhang-Suen), and the
 * lines walked from the right, each one followed round its curves. Letter
 * bodies go right to left; dots and other small marks follow the body they
 * belong to. Returns a function that draws the run at time t: the strokes
 * so far, as a thick round pen, used as a mask over the real letters.
 */
async function penWriting(r, x, y, size) {
  const K = 3; // raster px per px
  const top = 1.25 * size;
  const pad = 0.3 * size;
  const w = Math.ceil((r.w + 2 * pad) * K);
  const h = Math.ceil((top + 0.6 * size) * K);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w / K} ${h / K}"><defs>${r.defs}</defs>${r.draw(pad, top, "#fff")}</svg>`;
  const { data } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) ink[i] = data[i * 4 + 3] > 127 ? 1 : 0;

  // Distance to the edge (chamfer 3-4), for the pen's width.
  const dist = new Float32Array(w * h).fill(0);
  for (let i = 0; i < w * h; i++) dist[i] = ink[i] ? 1e9 : 0;
  const relax = (i, j, c) => dist[j] + c < dist[i] && (dist[i] = dist[j] + c);
  for (let yy = 1; yy < h - 1; yy++)
    for (let xx = 1; xx < w - 1; xx++) {
      const i = yy * w + xx;
      if (!ink[i]) continue;
      relax(i, i - 1, 3), relax(i, i - w, 3), relax(i, i - w - 1, 4), relax(i, i - w + 1, 4);
    }
  for (let yy = h - 2; yy > 0; yy--)
    for (let xx = w - 2; xx > 0; xx--) {
      const i = yy * w + xx;
      if (!ink[i]) continue;
      relax(i, i + 1, 3), relax(i, i + w, 3), relax(i, i + w + 1, 4), relax(i, i + w - 1, 4);
    }

  // Thin to one-pixel centre lines.
  const sk = ink.slice();
  for (let changed = true; changed; ) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const del = [];
      for (let yy = 1; yy < h - 1; yy++)
        for (let xx = 1; xx < w - 1; xx++) {
          const i = yy * w + xx;
          if (!sk[i]) continue;
          const n = [sk[i - w], sk[i - w + 1], sk[i + 1], sk[i + w + 1], sk[i + w], sk[i + w - 1], sk[i - 1], sk[i - w - 1]];
          const b = n.reduce((m, v) => m + v, 0);
          if (b < 2 || b > 6) continue;
          let a = 0;
          for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) a++;
          if (a !== 1) continue;
          const [p2, , p4, , p6, , p8] = n;
          if (pass === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
          del.push(i);
        }
      for (const i of del) sk[i] = 0;
      if (del.length) changed = true;
    }
  }

  const px = (i) => i % w;
  const py = (i) => (i / w) | 0;
  const nbrs = (i) => {
    const out = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const X = px(i) + dx;
        const Y = py(i) + dy;
        if (X >= 0 && Y >= 0 && X < w && Y < h && sk[Y * w + X]) out.push(Y * w + X);
      }
    return out;
  };

  // Connected pieces of ink: letter bodies and marks. Each keeps the
  // skeleton inside it (a dot can thin away to nothing).
  const comp = new Int32Array(w * h).fill(-1);
  const pieces = [];
  for (let i = 0; i < w * h; i++) {
    if (!ink[i] || comp[i] >= 0) continue;
    const id = pieces.length;
    const all = [i];
    comp[i] = id;
    for (let k = 0; k < all.length; k++) {
      const c = all[k];
      for (const n of [c - 1, c + 1, c - w, c + w, c - w - 1, c - w + 1, c + w - 1, c + w + 1])
        if (n >= 0 && n < w * h && ink[n] && comp[n] < 0 && Math.abs(px(n) - px(c)) <= 1) (comp[n] = id), all.push(n);
    }
    const xs = all.map(px);
    const cx = xs.reduce((m, v) => m + v, 0) / all.length;
    const cy = all.reduce((m, v) => m + py(v), 0) / all.length;
    pieces.push({ pix: all.filter((n) => sk[n]), minX: Math.min(...xs), maxX: Math.max(...xs), centre: [x - pad + cx / K, y - top + cy / K] });
  }

  // Walk a piece from its rightmost end, following the smoothest turn at
  // each step and coming back for branches later.
  const seen = new Uint8Array(w * h);
  function walk(piece) {
    if (!piece.pix.length) return [];
    const ends = piece.pix.filter((i) => nbrs(i).length === 1);
    const pool = ends.length ? ends : piece.pix;
    const start = pool.reduce((b, i) => (px(i) > px(b) || (px(i) === px(b) && py(i) < py(b)) ? i : b));
    const strokes = [];
    const stack = [start];
    seen[start] = 1;
    while (stack.length) {
      let cur = stack.pop();
      if (!nbrs(cur).some((n) => !seen[n])) continue;
      const line = [cur];
      for (;;) {
        const cand = nbrs(cur).filter((n) => !seen[n]);
        if (!cand.length) {
          // Close a loop (the eye of a و or ف) if it came back round.
          if (line.length > 8 && nbrs(cur).includes(line[0])) line.push(line[0]);
          break;
        }
        const back = line[Math.max(0, line.length - 5)];
        const dx = px(cur) - px(back);
        const dy = py(cur) - py(back);
        const score = (n) => {
          const sx = px(n) - px(cur);
          const sy = py(n) - py(cur);
          return (dx * sx + dy * sy) / (Math.hypot(sx, sy) * (Math.hypot(dx, dy) || 1));
        };
        const next = cand.reduce((b, n) => (score(n) > score(b) ? n : b));
        if (cand.length > 1) stack.push(cur);
        seen[next] = 1;
        // Neighbours of both steps are the same stroke, not a branch.
        for (const n of cand) if (n !== next && nbrs(next).includes(n) && nbrs(n).length <= 2) seen[n] = 1;
        line.push(next);
        cur = next;
      }
      strokes.push(line.map((i) => [x - pad + px(i) / K, y - top + py(i) / K]));
    }
    return strokes;
  }

  // Order: bodies right to left, each followed by its marks.
  const markLen = 0.3 * size * K;
  const bodies = pieces.filter((p) => p.pix.length >= markLen).sort((a, b) => b.maxX - a.maxX);
  const marks = pieces.filter((p) => p.pix.length < markLen);
  const owner = (m) => {
    const c = (m.minX + m.maxX) / 2;
    return bodies.reduce((b, p) => {
      const d = (q) => (c < q.minX ? q.minX - c : c > q.maxX ? c - q.maxX : 0);
      return d(p) < d(b) ? p : b;
    });
  };
  const order = bodies.flatMap((b) => [b, ...marks.filter((m) => owner(m) === b).sort((a, c) => c.maxX - a.maxX)]);

  // A timeline in px of pen travel, with a pause for each pen lift.
  const len = (pts) => pts.reduce((m, p, i) => (i ? m + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  const strokes = [];
  let total = 0;
  for (const piece of order) {
    total += 0.2 * size; // lift between pieces
    const isMark = piece.pix.length < markLen;
    const real = isMark ? [] : walk(piece).filter((pts) => len(pts) >= 1.5);
    // A dot is too small to trace: the pen just dabs it.
    if (isMark) {
      const [cx, cy] = piece.centre;
      real.push([
        [cx, cy],
        [cx - 0.01, cy],
      ]);
    }
    for (const pts of real) {
      const l = Math.max(len(pts), 0.07 * size);
      strokes.push({ pts, from: total, l });
      total += l + 0.04 * size;
    }
  }

  // The pen: wide enough to cover a stroke at its thickest.
  const radii = [];
  for (let i = 0; i < w * h; i++) if (sk[i]) radii.push(dist[i] / 3 / K);
  radii.sort((a, b) => a - b);
  const pen = 2 * radii[Math.floor(radii.length * 0.92)] * 1.25;

  return (t) => {
    const p = clamp01((t - WRITE_FROM) / WRITE_FOR);
    const fade = 1 - smooth((t - INK_FADE[0]) / (INK_FADE[1] - INK_FADE[0]));
    if (p <= 0 || fade <= 0) return "";
    // A gentle overall ease: starts unhurried, settles at the end.
    const done = (0.5 - 0.5 * Math.cos(Math.PI * p)) * total;
    const lines = [];
    for (const st of strokes) {
      if (st.from >= done) break;
      let pts = st.pts;
      if (done < st.from + st.l) {
        let acc = 0;
        const cutAt = done - st.from;
        const part = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          part.push(pts[i]);
          if (acc >= cutAt) break;
        }
        pts = part;
      }
      const thin = pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1);
      lines.push(`<polyline points="${thin.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ")}"/>`);
    }
    // The last moment: settle into the real letters, so no corner the pen
    // missed is left out.
    const settle = smooth((p - 0.92) / 0.08);
    const bx = x - pad;
    const by = y - top;
    return `<mask id="ink" maskUnits="userSpaceOnUse" x="${bx}" y="${by}" width="${w / K}" height="${h / K}">
      <g fill="none" stroke="#fff" stroke-width="${pen.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${lines.join("")}</g></mask>
    ${settle > 0 ? r.draw(x, y, CREAM, +(settle * fade).toFixed(3)) : ""}
    <g mask="url(#ink)">${r.draw(x, y, CREAM, +fade.toFixed(3))}</g>`;
  };
}

/** Prepares the card once; returns a function that draws it at time t. */
async function card() {
  const defs = [];
  const text = [];
  const shape = async (...args) => {
    const r = await run(...args);
    defs.push(r.defs);
    return r;
  };

  // The name, stacked: English centred in the nav and title face, and the
  // Urdu beneath it, smaller, in Reem Kufi.
  const size = 112;
  const urSize = 60;
  const en = await shape("Yousuf Zia", { face: "title", size, axes: { wght: 600, opsz: 48 }, spacing: -0.025 * size });
  const ur = await shape("یوسف ضیاء", { face: "kufi", size: urSize, axes: { wght: 700 } });
  const jhalarBottom = 36 * S;
  const bumperTop = H - 67 * S;
  // Centre the pair (English cap height to the Urdu's tails) between the trims.
  const lineGap = 0.82 * size;
  const top = -0.7 * size;
  const bottom = lineGap + 0.3 * urSize;
  const enBase = Math.round((jhalarBottom + bumperTop) / 2 - (top + bottom) / 2);
  const urBase = enBase + lineGap;
  const enX = (W - en.w) / 2;
  const urX = (W - ur.w) / 2;
  text.push(en.draw(enX, enBase, CREAM));
  const urdu = await penWriting(ur, urX, urBase, urSize);

  // Lattice glyphs: each shaped once, then stamped per cell, centred.
  const x0 = Math.min(enX, urX);
  const x1 = Math.max(enX + en.w, urX + ur.w);
  const clear = { x0: x0 - 40, x1: x1 + 40, y0: enBase - size * 0.92, y1: urBase + urSize * 0.45 };
  const glyphs = {};
  for (const g of "-|/\\*+.·") glyphs[g] = await shape(g, { face: "mono", size: 13 });
  const cells = latticeCells(clear);
  // The tint: a soft band sweeping diagonally, left to right, lighting
  // glyphs cell by cell in one company colour, then the next.
  const band = 240;
  const span = W + 0.45 * H;
  const wave = LOOP / WAVES.length;
  function lattice(t) {
    const k = Math.floor(t / wave) % WAVES.length;
    const front = -band + (span + 2 * band) * ((t % wave) / wave);
    const colour = COMPANY[WAVES[k]];
    return cells
      .map(({ ch, x, y, a, fade, ring, h, hr }) => {
        const lit = Math.max(0, 1 - Math.abs(x + 0.45 * y - front) / band);
        const g = glyphs[ch];
        const at = (fill, op) => g.draw(x - g.w / 2, y + 4.5, fill, +op.toFixed(2));
        // The site's hover: a ring of dots typed in inside each star...
        if (ring) return hr < lit * 1.1 ? at(colour, fade) : "";
        // ...and every glyph switching to the colour.
        return h < Math.pow(lit, 0.8) ? at(colour, fade) : at(LATTICE, a);
      })
      .join("");
  }

  // The bumper: pinstripes, a dotted black panel, stars either side of the
  // slogan «دیکھ مگر پیار سے», "look, but with love".
  const by = bumperTop + 9 * S;
  const mid = by + (H - by) / 2;
  const slogan = await shape("دیکھ مگر پیار سے", { face: "nastaliq", size: 22 * S, axes: { wght: 400 } });
  text.push(slogan.draw(W / 2 - slogan.w / 2, mid + 6, "#ffd23f"));
  const gutter = slogan.w / 2 + 22 * S;
  const stars = (from, dir) =>
    ["#ff8fc1", "#ffe066", "#9fdcff"]
      .map((c, i) => `<polygon points="${star(from + dir * i * 15 * S, mid, 5 * S)}" fill="${c}"/>`)
      .join("");

  const head = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="halftone" width="4" height="4" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#000" fill-opacity="0.11"/>
    </pattern>
    <pattern id="rail" width="8" height="6" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="3" r="1.4" fill="${CREAM}"/>
    </pattern>
    <pattern id="bumperDots" width="${10 * S}" height="${H - by}" patternUnits="userSpaceOnUse" y="${by}">
      <circle cx="${5 * S}" cy="${4 * S}" r="${1.3 * S}" fill="${CREAM}"/>
      <circle cx="${5 * S}" cy="${H - by - 4 * S}" r="${1.3 * S}" fill="${CREAM}"/>
    </pattern>
    ${defs.join("")}
  </defs>
  <rect width="${W}" height="${H}" fill="${GROUND}"/>
  <rect width="${W}" height="${H}" fill="url(#halftone)"/>`;
  const tail = `<rect y="${bumperTop}" width="${W}" height="${3 * S}" fill="#d9432b"/>
  <rect y="${bumperTop + 3 * S}" width="${W}" height="${3 * S}" fill="#ffe066"/>
  <rect y="${bumperTop + 6 * S}" width="${W}" height="${3 * S}" fill="#1f7a46"/>
  <rect y="${by}" width="${W}" height="${H - by}" fill="${INK}"/>
  <rect y="${by}" width="${W}" height="${H - by}" fill="url(#bumperDots)"/>
  ${stars(W / 2 - gutter, -1)}
  ${stars(W / 2 + gutter, 1)}
  ${text.join("")}
</svg>`;
  return (t, format = "png") => {
    const img = sharp(Buffer.from(head + lattice(t) + jhalar(t) + tail.replace("</svg>", urdu(t) + "</svg>")));
    return format === "raw" ? img.removeAlpha().raw().toBuffer() : img.png().toBuffer();
  };
}

// -------------------------------------------------------------------- write

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

await writeFile(target("app/icon.svg"), iconSvg() + "\n");
// Each size drawn from its own SVG so the small ones stay crisp.
const icoPngs = await Promise.all([16, 32, 48].map(async (size) => ({ size, buf: await png(iconSvg({ size }), size) })));
await writeFile(target("app/favicon.ico"), ico(icoPngs));
// iOS rounds the corners itself, so the apple icon is full bleed.
await writeFile(target("app/apple-icon.png"), await png(iconSvg({ size: 180, tile: false }), 180));

const frame = await card();
await writeFile(target("public/og.png"), await frame(STILL));

// The video: frames as PNGs into a scratch folder, then encoded to H.264
// by AVFoundation (scripts/encode-mp4.swift), which ships with macOS.
const frames = await mkdtemp(path.join(os.tmpdir(), "og-frames-"));
const count = Math.round(LOOP * FPS);
for (let i = 0; i < count; i++) {
  await writeFile(path.join(frames, `${String(i).padStart(4, "0")}.png`), await frame(i / FPS));
}
// Keep the frames when reviewing (scripts/brand.mjs <dir>), for a look without the encoder.
if (outDir) await promisify(execFile)("cp", ["-R", frames, path.join(outDir, "frames")]);
// The module cache goes in the temp folder so it works in a sandbox too.
const swiftArgs = ["-module-cache-path", path.join(os.tmpdir(), "swift-module-cache")];
await promisify(execFile)(
  "swift",
  [...swiftArgs, path.join(root, "scripts/encode-mp4.swift"), frames, String(FPS), target("public/og.mp4")],
  { maxBuffer: 1 << 24, timeout: 180_000 },
).finally(() => rm(frames, { recursive: true }));

console.log(`wrote icon.svg, favicon.ico, apple-icon.png, og.png, og.mp4${outDir ? ` to ${outDir}` : ""}`);
