"use client";

import { useEffect, useRef } from "react";

/**
 * Islamic star-pattern shader, two ways:
 *
 *  - lattice: an 8-fold star-and-cross lattice drawn in ASCII strokes
 *    (- | / \) across the page background. Every star traces itself in on
 *    load, the column stays clear, and hovering a project fills the stars
 *    with that project's colour.
 *  - plate:   the same geometry as flat, printed colour inside one element,
 *    laid out like a chromolithograph plate of tile panels. Hovering a
 *    project re-lays the tiles in that project's colour.
 *
 * Both patterns come from one construction: a star is the union of an
 * axis-aligned square and the same square turned 45 degrees.
 */

export type GeoMode = "lattice" | "plate";

// Glyph atlas. Indices are used directly by the shader.
const ATLAS = " .·:-|/\\+*";
const CELL_W = 9;
const CELL_H = 15;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uCell;
uniform sampler2D uAtlas;
uniform float uN;
uniform int uMode;
uniform float uTime;
uniform float uScroll;
uniform float uDpr;
uniform vec4 uCol;     // text column rect (px, top-left origin)
uniform vec4 uRect;    // plate rect
uniform float uBuild;  // 0..1, construction on load
uniform float uTint;   // 0..1, hover colour
uniform vec3 uColour;
uniform vec3 uInk;
uniform int uPattern;  // 0 star-and-cross, 1 octagons, 2 hexagons and triangles, 3 lozenges
out vec4 outColor;

const float R2 = 0.70710678;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
vec2 r45(vec2 p) { return mat2(R2, -R2, R2, R2) * p; }
// Eight-pointed star: a square and the same square at 45 degrees.
float star8(vec2 q, float s) { return min(sdBox(q, vec2(s)), sdBox(r45(q), vec2(s))); }
// Octagon: their intersection.
float oct8(vec2 q, float s) { return max(sdBox(q, vec2(s)), sdBox(r45(q), vec2(s))); }

// Star-and-cross. Stars sit on a unit grid with their points just touching;
// the space left between four stars is the cross.
float outerStar(vec2 p) { vec2 q = p - floor(p + 0.5); return star8(q, 0.3536); }

vec3 hex(float r, float g, float b) { return vec3(r, g, b) / 255.0; }

// Line families for the other patterns. A glyph cell is 9x15, so the slash
// glyphs lean at about 59 degrees: six-fold patterns draw as cleanly as
// eight-fold ones.
const vec2 K0 = vec2(0.0, 1.0);             // hexagons and triangles:
const vec2 K1 = vec2(-0.8660254, -0.5);     // three families, 120 degrees
const vec2 K2 = vec2(0.8660254, -0.5);      // apart, one shifted half a step
const vec2 D1 = vec2(0.8660254, -0.5);      // lozenges: two families
const vec2 D2 = vec2(0.8660254, 0.5);       // at +/-60 degrees
float dn(float x) { return abs(x - floor(x + 0.5)); }

// Distance to the pattern's strokes, in pattern units (signed for the
// closed shapes, unsigned for the line families).
float field(vec2 p) {
  if (uPattern == 1) { vec2 q = p - floor(p + 0.5); return oct8(q, 0.5); }
  if (uPattern == 2) return min(dn(dot(p, K0) + 0.5), min(dn(dot(p, K1)), dn(dot(p, K2))));
  if (uPattern == 3) return min(dn(dot(p, D1)), dn(dot(p, D2)));
  return outerStar(p);
}

// ---------------------------------------------------------------- lattice
vec4 lattice(vec2 px, vec2 cell) {
  vec2 c = (cell + 0.5) * uCell;
  // Pattern unit in px: one star, octagon, hexagon row or lozenge.
  float unit = uPattern == 1 ? 150.0 : uPattern == 2 ? 96.0 : uPattern == 3 ? 72.0 : 264.0;
  float sc = unit * uDpr;
  // Fixed to the screen: the page scrolls over it. Moving it would make the
  // glyphs shimmer as strokes slide between character cells.
  vec2 origin = vec2(uRes.x * 0.5, uRes.y * 0.42);
  vec2 p = (c - origin) / sc;
  vec2 id = floor(p + 0.5);
  vec2 q = p - id;
  float o = field(p);

  // Stroke direction from the SDF gradient picks the glyph, and how wide
  // the stroke may be: a glyph is 9 wide and 15 tall, so horizontal runs
  // can take half a cell height, vertical runs half a width.
  float e = 0.75 / sc;
  vec2 g = vec2(field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0)),
                field(p + vec2(0.0, e)) - field(p - vec2(0.0, e)));
  vec2 tng = vec2(-g.y, g.x);
  float ax = abs(tng.x), ay = abs(tng.y);
  float idx, halfW;
  if (ax > ay * 2.0) { idx = 4.0; halfW = 0.5 * uCell.y; }        // -
  else if (ay > ax * 2.0) { idx = 5.0; halfW = 0.5 * uCell.x; }   // |
  else { idx = tng.x * tng.y < 0.0 ? 6.0 : 7.0; halfW = 0.36 * uCell.y; } // slash or backslash
  if (abs(o) * sc > halfW) idx = 0.0;

  // Construction: strokes trace around each cell's centre, with a
  // per-cell delay, like compass work.
  float ang = atan(q.y, q.x) / 6.2831853 + 0.5;
  float t = clamp(uBuild * 1.8 - hash(id) * 0.8, 0.0, 1.0);
  if (ang > t) idx = 0.0;
  bool done = t > 0.98;

  vec3 col = uInk;
  float alpha = 0.75;
  bool alt = mod(cell.x + cell.y, 2.0) < 0.5;

  if (uPattern == 0) {
    // Star and cross centres; stars get a faint dotted fill.
    vec2 corner = abs(q) - 0.5;
    if (done && length(q * sc / uCell) < 0.6) idx = 9.0;           // *
    if (done && length(corner * sc / uCell) < 0.6) idx = 8.0;      // +
    if (idx < 1.0 && o * sc < -halfW * 1.6 && done && alt) { idx = 1.0; alpha = 0.55; }
  } else if (uPattern == 1) {
    // Octagons marked at the centre; the small squares between are dotted.
    if (done && length(q * sc / uCell) < 0.6) idx = 9.0;
    if (idx < 1.0 && o * sc > halfW * 1.2 && done) { idx = 1.0; alpha = 0.55; }
  } else if (uPattern == 3) {
    // Lozenges in a chequer: alternate ones dotted, the rest marked at the
    // centre, like a painted truck panel.
    float k = floor(dot(p, D1)) + floor(dot(p, D2));
    bool filled = mod(k, 2.0) < 0.5;
    if (idx < 1.0 && done && filled && o * sc > halfW * 1.3 && alt) { idx = 1.0; alpha = 0.55; }
    if (done && !filled && dn(dot(p, D1) + 0.5) * sc < 0.55 * uCell.x && dn(dot(p, D2) + 0.5) * sc < 0.55 * uCell.x) idx = 9.0;
  }

  // Hover: every glyph switches to the company colour, cell by cell.
  if (idx >= 1.0 && hash(cell + 7.0) < uTint) { col = uColour; alpha = 1.0; }

  // Hover: a ring of dots inside each star or octagon, typed in.
  if (uPattern <= 1 && uTint > 0.0) {
    float inner = uPattern == 0 ? star8(q, 0.22) : oct8(q, 0.3);
    if (abs(inner) * sc < 0.5 * uCell.x && hash(cell) < uTint * 1.1) { idx = 2.0; col = uColour; alpha = 1.0; }
  }

  // Keep the column clear.
  vec2 a = uCol.xy - 8.0 * uDpr, b = uCol.xy + uCol.zw + 8.0 * uDpr;
  vec2 dd = max(a - c, c - b);
  float inCol = 1.0 - smoothstep(0.0, 32.0 * uDpr, max(dd.x, dd.y));
  alpha *= 1.0 - inCol;

  if (idx < 1.0) return vec4(0.0);
  vec2 local = fract(px / uCell);
  float gl = texture(uAtlas, vec2((idx + local.x) / uN, local.y)).a;
  float a2 = gl * alpha;
  return vec4(col * a2, a2);
}

// ------------------------------------------------------------------ plate
// Region colours for one tile panel. kind 0: star-and-cross, 1: octagons
// and squares, 2: star-and-cross at 45 degrees.
vec3 panel(vec2 p, int kind, float aa, vec3 c1, vec3 c2, vec3 c3, vec3 c4, vec3 strap) {
  if (kind == 2) p = r45(p);
  vec2 id = floor(p + 0.5);
  vec2 q = p - id;
  float w = 0.035;
  float o = kind == 1 ? oct8(q, 0.44) : star8(q, 0.3536);
  float inner = kind == 1 ? star8(q, 0.25) : oct8(q, 0.17);
  vec2 corner = abs(q) - 0.5;
  float cr = kind == 1 ? sdBox(r45(corner), vec2(0.115)) : sdBox(r45(corner), vec2(0.07));

  // Fill: outer shape, inner rosette, the cross between, its centre.
  vec3 fill = o < 0.0 ? (inner < 0.0 ? c2 : c1) : (cr < 0.0 ? c4 : c3);
  // Hover re-lays tiles in the project colour, one tile at a time.
  if (o < 0.0 && uTint > 0.0 && hash(id + float(kind) * 7.0) < uTint) fill = inner < 0.0 ? c4 : uColour;
  // Strapwork: a band along every edge.
  float band = min(min(abs(o), abs(inner)), abs(cr));
  float s = 1.0 - smoothstep(w - aa, w + aa, band);
  return mix(fill, strap, s);
}

vec4 plate(vec2 px) {
  vec2 r = px - uRect.xy;
  if (r.x < 0.0 || r.y < 0.0 || r.x > uRect.z || r.y > uRect.w) return vec4(0.0);
  vec2 u = r / uRect.zw;

  vec3 ground = hex(112.0, 186.0, 172.0);   // turquoise gutters
  vec3 strap = hex(246.0, 241.0, 230.0);
  vec3 red = hex(217.0, 67.0, 43.0);
  vec3 green = hex(31.0, 122.0, 70.0);
  vec3 orange = hex(239.0, 154.0, 42.0);
  vec3 plum = hex(110.0, 44.0, 67.0);
  vec3 black = hex(28.0, 26.0, 25.0);

  float g = 8.0 * uDpr;                     // gutter
  float split = 0.58 * uRect.z;
  float mid = 0.5 * uRect.w;
  float drift = uTime * 0.015;
  vec3 col = ground;

  // Left panel: star-and-cross. Right: octagons over 45-degree stars.
  if (r.x > g && r.x < split - g * 0.5 && r.y > g && r.y < uRect.w - g) {
    float sc = 64.0 * uDpr;
    col = panel((r - vec2(split * 0.5, uRect.w * 0.5)) / sc + vec2(drift, 0.0), 0, 1.0 / sc, red, orange, green, black, strap);
  } else if (r.x > split + g * 0.5 && r.x < uRect.z - g && r.y > g && r.y < mid - g * 0.5) {
    float sc = 52.0 * uDpr;
    col = panel(r / sc + vec2(0.0, drift), 1, 1.0 / sc, plum, orange, green, red, strap);
  } else if (r.x > split + g * 0.5 && r.x < uRect.z - g && r.y > mid + g * 0.5 && r.y < uRect.w - g) {
    float sc = 30.0 * uDpr;
    col = panel(r / sc - vec2(drift, 0.0), 2, 1.0 / sc, green, red, orange, plum, strap);
  }

  // Print texture: a little paper grain.
  col *= 0.97 + 0.05 * hash(floor(px / uDpr));
  return vec4(col, 1.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  outColor = uMode == 0 ? lattice(px, cell) : plate(px);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function GeoField({
  mode,
  colour,
  tint,
  ink = "#a3a3a0",
  pattern = 0,
  columnRef,
  plateRef,
}: {
  mode: GeoMode;
  /** Hover colour, and whether something is hovered. */
  colour: string;
  tint: boolean;
  /** Glyph colour for the lattice strokes. */
  ink?: string;
  /** Lattice pattern: 0 star-and-cross, 1 octagons, 2 hexagons, 3 lozenges. */
  pattern?: number;
  columnRef: React.RefObject<HTMLElement>;
  plateRef?: React.RefObject<HTMLElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const props = useRef({ mode, colour, tint, ink, pattern });
  props.current = { mode, colour, tint, ink, pattern };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let dpr = 1;
    const atlasTex = gl.createTexture()!;
    const buildAtlas = () => {
      const cw = Math.round(CELL_W * dpr);
      const ch = Math.round(CELL_H * dpr);
      const c = document.createElement("canvas");
      c.width = cw * ATLAS.length;
      c.height = ch;
      const x = c.getContext("2d")!;
      const family = getComputedStyle(document.body).getPropertyValue("--font-fragment-mono").trim() || "monospace";
      x.font = `${Math.round(13 * dpr)}px ${family}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#fff";
      for (let i = 0; i < ATLAS.length; i++) x.fillText(ATLAS[i], i * cw + cw / 2, ch / 2 + dpr);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      buildAtlas();
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let buildStart = performance.now();
    let tint = 0;
    let lastMode = props.current.mode;
    let raf = 0;
    let last = performance.now();
    const start = last;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = props.current;
      if (p.mode !== lastMode) { lastMode = p.mode; buildStart = now; }

      // Construction takes ~2.2s; hover colour eases in and out.
      const build = reduce.matches ? 1 : Math.min(1, (now - buildStart) / 2200);
      const target = p.tint ? 1 : 0;
      tint = reduce.matches ? target : tint + (target - tint) * Math.min(1, dt * (target ? 3 : 5));
      if (Math.abs(tint - target) < 0.002) tint = target;

      const col = columnRef.current?.getBoundingClientRect();
      const plate = plateRef?.current?.getBoundingClientRect();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform2f(U("uCell"), CELL_W * dpr, CELL_H * dpr);
      gl.uniform1f(U("uN"), ATLAS.length);
      gl.uniform1i(U("uMode"), p.mode === "lattice" ? 0 : 1);
      gl.uniform1f(U("uTime"), reduce.matches ? 0 : (now - start) / 1000);
      gl.uniform1f(U("uScroll"), window.scrollY * dpr);
      gl.uniform1f(U("uDpr"), dpr);
      if (col) gl.uniform4f(U("uCol"), col.x * dpr, col.y * dpr, col.width * dpr, col.height * dpr);
      gl.uniform4f(U("uRect"), (plate?.x ?? 0) * dpr, (plate?.y ?? 0) * dpr, (plate?.width ?? 0) * dpr, (plate?.height ?? 0) * dpr);
      gl.uniform1f(U("uBuild"), 1 - Math.pow(1 - build, 3));
      gl.uniform1f(U("uTint"), tint);
      gl.uniform3f(U("uColour"), ...hexToRgb(p.colour));
      gl.uniform3f(U("uInk"), ...hexToRgb(p.ink));
      gl.uniform1i(U("uPattern"), p.pattern);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(U("uAtlas"), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    document.fonts.ready.then(buildAtlas);
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
    };
  }, [columnRef, plateRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
