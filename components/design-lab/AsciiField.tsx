"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen ASCII shader. Each screen cell is drawn as one glyph from a
 * font atlas, chosen by a "source" value computed for that cell:
 *
 *  - light:   sunlight through blinds, angled by the time of day
 *  - hover:   whatever image is hovered, typed in glyph by glyph
 *  - margins: photos running down the empty margins, with scroll parallax
 *
 * The page column (`columnRef`) is passed in so glyphs can stay out of the
 * way of the text.
 */

export type FieldMode = "light" | "hover" | "margins";

const RAMP = " .:-=+*x#%@";
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
uniform float uHour;
uniform float uScroll;
uniform vec4 uCol;          // column rect: x, y, w, h (px, top-left origin)
uniform sampler2D uImg;
uniform float uImgAspect;
uniform float uImgReady;
uniform float uReveal;
uniform sampler2D uImg2;
uniform float uImg2Aspect;
uniform vec3 uColour;
uniform vec3 uInk;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// Sample an image with object-fit: cover over a region.
vec3 cover(sampler2D img, float imgAspect, vec2 uv, float regionAspect) {
  vec2 s = vec2(1.0);
  if (regionAspect > imgAspect) s.y = imgAspect / regionAspect; else s.x = regionAspect / imgAspect;
  return texture(img, (uv - 0.5) * s + 0.5).rgb;
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(px / uCell);
  vec2 local = fract(px / uCell);
  vec2 c = (cell + 0.5) * uCell;
  float v = 0.0;
  vec3 col = uInk;
  float alpha = 1.0;

  // 1 inside the text column (with a soft edge), 0 outside.
  vec2 a = uCol.xy - 24.0, b = uCol.xy + uCol.zw + 24.0;
  vec2 dd = max(a - c, c - b);
  float inCol = 1.0 - smoothstep(0.0, 48.0, max(dd.x, dd.y));

  if (uMode == 0) {
    // Sunlight through blinds. The sun travels across the day: low from the
    // left in the morning, high around noon, low from the right at dusk.
    vec2 p = c / uRes.y;
    float aspect = uRes.x / uRes.y;
    float day = clamp((uHour - 6.0) / 14.0, 0.0, 1.0);
    bool night = uHour < 6.0 || uHour > 20.0;
    float ang = mix(-0.55, 0.55, day) + (night ? 0.2 : 0.0);
    vec2 origin = vec2(mix(0.15, 0.85, day) * aspect, mix(-0.05, 0.15, abs(day - 0.5) * 2.0));
    mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 q = R * (p - origin);
    // A window-shaped pane, stretched along the light direction.
    float w = 0.34, len = mix(1.05, 0.7, abs(day - 0.5) * 2.0);
    float pane = smoothstep(w, w - 0.08, abs(q.x)) * smoothstep(0.0, 0.08, q.y) * smoothstep(len, len - 0.35, q.y);
    // Blinds: slats across the pane.
    float slat = smoothstep(0.38, 0.5, fract(q.y * 11.0 + 0.25)) * smoothstep(0.98, 0.86, fract(q.y * 11.0 + 0.25));
    // A second, narrower window.
    vec2 q2 = q - vec2(w * 2.0 + 0.12, 0.04);
    float pane2 = smoothstep(w * 0.55, w * 0.55 - 0.06, abs(q2.x)) * smoothstep(0.0, 0.08, q2.y) * smoothstep(len * 0.8, len * 0.8 - 0.3, q2.y);
    float shimmer = 0.85 + 0.15 * noise(c / 90.0 + uTime * 0.15);
    v = (pane + pane2) * slat * shimmer * (1.0 - 0.6 * smoothstep(0.0, len, q.y));
    v *= mix(1.0, 0.12, inCol);
    vec3 warm = mix(vec3(0.93, 0.48, 0.13), vec3(0.95, 0.70, 0.38), v);
    vec3 moon = vec3(0.47, 0.55, 0.78);
    col = night ? moon : warm;
    if (night) v *= 0.6;
  } else if (uMode == 1) {
    // Hover: the hovered image, typed in across the whole screen.
    if (uImgReady > 0.5) {
      vec2 uv = c / uRes;
      vec3 s = cover(uImg, uImgAspect, uv, uRes.x / uRes.y);
      v = 1.0 - lum(s);
      v = smoothstep(0.15, 0.95, v);
      float h = hash(cell);
      float shown = step(h, uReveal);
      float edge = step(h, uReveal) * step(uReveal - 0.12, h) * step(uReveal, 0.999);
      v *= shown;
      if (edge > 0.5) v = 0.35 + 0.6 * hash(cell + floor(uTime * 24.0));
      v *= mix(1.0, 0.22, inCol);
      col = mix(uInk, uColour, smoothstep(0.2, 0.7, v));
    }
  } else {
    // Margins: one photo down each side of the column, scrolling slower
    // than the page.
    float gap = 56.0;
    float left = uCol.x - gap;
    float rightStart = uCol.x + uCol.z + gap;
    float mw = min(left, uRes.x - rightStart);
    if (mw > 110.0) {
      float sy = c.y + uScroll * 0.55;
      if (c.x < left && c.x > left - mw) {
        float x = (c.x - (left - mw)) / mw;
        float hgt = mw / uImgAspect;
        vec2 uv = vec2(x, fract(sy / (hgt + 160.0)) * (hgt + 160.0) / hgt);
        if (uv.y <= 1.0 && uImgReady > 0.5) v = 1.0 - lum(texture(uImg, uv).rgb);
      } else if (c.x > rightStart && c.x < rightStart + mw) {
        float x = (c.x - rightStart) / mw;
        float hgt = mw / uImg2Aspect;
        float sy2 = sy + hgt * 0.5;
        vec2 uv = vec2(x, fract(sy2 / (hgt + 160.0)) * (hgt + 160.0) / hgt);
        if (uv.y <= 1.0 && uImgReady > 0.5) v = 1.0 - lum(texture(uImg2, uv).rgb);
      }
      v = smoothstep(0.2, 0.95, v);
      col = hash(cell * 1.3) > 0.97 ? uColour : uInk;
      alpha = 0.7;
    }
  }

  float idx = floor(clamp(v, 0.0, 0.999) * uN);
  if (idx < 1.0) { outColor = vec4(0.0); return; }
  float g = texture(uAtlas, vec2((idx + local.x) / uN, local.y)).a;
  float o = g * alpha;
  outColor = vec4(col * o, o);
}`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function loadTexture(gl: WebGL2RenderingContext, src: string) {
  return new Promise<{ tex: WebGLTexture; aspect: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tex = gl.createTexture()!;
      // Use a spare unit so the glyph atlas on unit 0 stays bound.
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      resolve({ tex, aspect: img.width / img.height });
    };
    img.onerror = reject;
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=640&q=70`;
  });
}

export default function AsciiField({
  mode,
  hour,
  image,
  colour,
  marginImages,
  columnRef,
}: {
  mode: FieldMode;
  hour: number;
  /** Hover mode: the image to show, or null for nothing. */
  image: string | null;
  colour: string;
  marginImages: [string, string];
  columnRef: React.RefObject<HTMLElement>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const props = useRef({ mode, hour, image, colour, marginImages });
  props.current = { mode, hour, image, colour, marginImages };

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
      c.width = cw * RAMP.length;
      c.height = ch;
      const x = c.getContext("2d")!;
      const family = getComputedStyle(document.body).getPropertyValue("--font-fragment-mono").trim() || "monospace";
      x.font = `${Math.round(12.5 * dpr)}px ${family}`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#fff";
      for (let i = 0; i < RAMP.length; i++) x.fillText(RAMP[i], i * cw + cw / 2, ch / 2 + dpr);
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

    // Images, cached by src.
    const cache = new Map<string, { tex: WebGLTexture; aspect: number } | "loading">();
    const get = (src: string | null) => {
      if (!src) return null;
      const hit = cache.get(src);
      if (hit && hit !== "loading") return hit;
      if (!hit) {
        cache.set(src, "loading");
        loadTexture(gl, src).then((t) => cache.set(src, t)).catch(() => cache.delete(src));
      }
      return null;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reveal = 0;
    let shownImage: string | null = null;
    let raf = 0;
    let last = performance.now();
    const start = last;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = props.current;

      // Hover reveal: swap images immediately, type in over ~0.6s, fade out
      // a little faster.
      if (p.image !== shownImage && p.image) { shownImage = p.image; reveal = 0; }
      const target = p.image ? 1 : 0;
      if (reduce.matches) reveal = target;
      else reveal += (target - reveal) * Math.min(1, dt * (target ? 3.2 : 5));
      if (!p.image && reveal < 0.01) shownImage = null;

      const col = columnRef.current?.getBoundingClientRect();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      gl.uniform2f(U("uCell"), CELL_W * dpr, CELL_H * dpr);
      gl.uniform1f(U("uN"), RAMP.length);
      gl.uniform1i(U("uMode"), p.mode === "light" ? 0 : p.mode === "hover" ? 1 : 2);
      gl.uniform1f(U("uTime"), reduce.matches ? 0 : (now - start) / 1000);
      gl.uniform1f(U("uHour"), p.hour);
      gl.uniform1f(U("uScroll"), window.scrollY * dpr);
      if (col) gl.uniform4f(U("uCol"), col.x * dpr, col.y * dpr, col.width * dpr, col.height * dpr);
      gl.uniform3f(U("uColour"), ...hexToRgb(p.colour));
      gl.uniform3f(U("uInk"), ...hexToRgb("#8e8e8b"));

      const img = get(p.mode === "hover" ? shownImage : p.marginImages[0]);
      const img2 = get(p.marginImages[1]);
      // Image loads bind on whichever unit is active, so rebind the atlas.
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.uniform1i(U("uAtlas"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, img?.tex ?? null);
      gl.uniform1i(U("uImg"), 1);
      gl.uniform1f(U("uImgAspect"), img?.aspect ?? 1);
      gl.uniform1f(U("uImgReady"), img ? 1 : 0);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, img2?.tex ?? null);
      gl.uniform1i(U("uImg2"), 2);
      gl.uniform1f(U("uImg2Aspect"), img2?.aspect ?? 1);
      gl.uniform1f(U("uReveal"), reveal);
      gl.activeTexture(gl.TEXTURE0);
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
  }, [columnRef]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
