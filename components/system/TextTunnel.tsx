"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Rows of text wrapped around the inside of a tapered tube, seen in
 * perspective, so they read as concentric rings receding to a vanishing
 * point. Each row slides around the tube at its own speed and direction
 * (after stripe.press/scaling's per-row hashed speeds).
 *
 * Every ring gets its own texture row, filled with whole words to fit that
 * ring's circumference, so glyphs keep their true proportions at any depth
 * and the seam always falls between words.
 *
 * Whole words light up in the accent colour as they cross 12 o'clock.
 * For that, the texture's green channel stores each word's centre (as a
 * fraction of the texture width) under the word's box, and the blue channel
 * marks where a word is. The shader turns that centre into an angle.
 */

export type TunnelRows = string[][];

const TEX_W = 2048;
const ROW_H = 72;
const FONT_PX = 42;
const SEP = "  ·  ";

const ROWS_ON_TUBE = 26;
const LENGTH = 26;
const R_NEAR = 7.0;
const R_FAR = 1.2;
const Z_NEAR = -0.4;

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
varying float vDepth;
void main() {
  vUv = uv;
  vPos = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uRows;
uniform float uOffset;
uniform float uTime;
uniform float uFar;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uBg;
varying vec2 vUv;
varying vec3 vPos;
varying float vDepth;

float hash(float n) { return fract(sin(n * 78.233) * 43758.5453); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

const float PI = 3.14159265;

void main() {
  float row = floor(vUv.y * uRows);
  float fy = fract(vUv.y * uRows);

  float dir = mod(row, 2.0) < 1.0 ? 1.0 : -1.0;
  float speed = dir * (0.55 + 0.9 * hash(row + 1.0));
  float u = (1.0 - vUv.x) + uOffset * speed + hash(row + 9.0);

  // Texture row 0 is the far ring. Glyph tops face the viewer, like text
  // printed around a ring.
  float ty = (row + (1.0 - fy)) / uRows;
  // Gradients from the unwrapped coordinate, so mip selection doesn't spike
  // where fract(u) wraps.
  vec2 uvT = vec2(u, ty);
  vec3 s = textureGrad(uTex, vec2(fract(u), ty), dFdx(uvT), dFdy(uvT)).rgb;
  float ink = s.r;

  // Angle of this fragment from 12 o'clock, then of its word's centre.
  float phi = atan(vPos.x, vPos.y);
  float du = s.g - fract(u);
  du -= floor(du + 0.5);
  float phiWord = phi + 2.0 * PI * du;
  phiWord -= 2.0 * PI * floor(phiWord / (2.0 * PI) + 0.5);
  float lit = step(0.5, s.b) * (1.0 - smoothstep(0.10, 0.16, abs(phiWord)));

  // Fade by apparent size (ring radius over distance) rather than depth, so
  // only a compact disc of rings around the vanishing point shows. Inner
  // rings are brighter, like the reference; the very centre fades out
  // before it gets dense.
  float apparent = length(vPos.xy) / vDepth;
  float fade = (1.0 - smoothstep(0.26, 0.4, apparent)) * smoothstep(0.035, 0.07, apparent);
  float tone = mix(0.36, 0.1, smoothstep(0.06, 0.36, apparent));
  // Only a band of rings carries the read head, so it reads as one or two
  // lit words rather than a stripe.
  lit *= smoothstep(0.17, 0.2, apparent) * (1.0 - smoothstep(0.27, 0.3, apparent));

  vec3 col = mix(uInk * tone, uAccent * 0.75, lit);
  col = mix(uBg, col, ink * fade);

  float grain = hash2(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5;
  col += grain * 0.015;
  gl_FragColor = vec4(col, 1.0);
}`;

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

async function buildTexture(rows: TunnelRows, family: string) {
  // Each ring's circumference, measured in row heights, is how wide its
  // text should be at true proportions.
  const rowLen = LENGTH / ROWS_ON_TUBE;
  const ringAspect = Array.from({ length: ROWS_ON_TUBE }, (_, j) => {
    const r = R_FAR + (R_NEAR - R_FAR) * ((j + 0.5) / ROWS_ON_TUBE);
    return (2 * Math.PI * r) / rowLen;
  });
  const font = `${FONT_PX}px ${family}`;
  try {
    await document.fonts.load(font);
  } catch {}

  const H = ROW_H * ROWS_ON_TUBE;
  const ink = document.createElement("canvas");
  const meta = document.createElement("canvas");
  ink.width = meta.width = TEX_W;
  ink.height = meta.height = H;
  const a = ink.getContext("2d")!;
  const b = meta.getContext("2d")!;
  a.fillStyle = "#000";
  a.fillRect(0, 0, TEX_W, H);
  b.fillStyle = "#000";
  b.fillRect(0, 0, TEX_W, H);
  a.font = font;
  a.textBaseline = "middle";
  a.fillStyle = "#fff";

  const sepW = a.measureText(SEP).width;
  const cursor = rows.map(() => 0);
  for (let j = 0; j < ROWS_ON_TUBE; j++) {
    const list = rows[j % rows.length];
    const target = ringAspect[j] * ROW_H;
    // Take whole words until the ring is as full as it can get.
    const picked: { w: string; width: number }[] = [];
    let total = 0;
    while (true) {
      const w = list[cursor[j % rows.length] % list.length];
      const width = a.measureText(w).width + sepW;
      if (picked.length && Math.abs(total + width - target) > Math.abs(total - target)) break;
      picked.push({ w, width });
      total += width;
      cursor[j % rows.length]++;
    }
    const sx = TEX_W / total;
    const y = j * ROW_H + ROW_H / 2;
    let x = 0;
    picked.forEach(({ w, width }) => {
      const wpx = (width - sepW) * sx;
      a.save();
      a.translate(x, y);
      a.scale(sx, 1);
      a.fillText(w, 0, 0);
      a.restore();
      b.fillStyle = `rgb(0, ${Math.round(((x + wpx / 2) / TEX_W) * 255)}, 255)`;
      b.fillRect(Math.floor(x), j * ROW_H, Math.ceil(wpx), ROW_H);
      x += width * sx;
    });
  }

  const ia = a.getImageData(0, 0, TEX_W, H);
  const ib = b.getImageData(0, 0, TEX_W, H);
  for (let i = 0; i < ia.data.length; i += 4) {
    ia.data[i + 1] = ib.data[i + 1];
    ia.data[i + 2] = ib.data[i + 2];
  }
  a.putImageData(ia, 0, 0);

  const tex = new THREE.CanvasTexture(ink);
  tex.flipY = false;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

export default function TextTunnel({ rows, className }: { rows: TunnelRows; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let raf = 0;
    const cleanups: (() => void)[] = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(cssColor("--sys-bg", "#0b0b0a"));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
    camera.position.set(-0.55, 0.35, 0);
    camera.rotation.order = "YXZ";

    const geo = new THREE.CylinderGeometry(R_NEAR, R_FAR, LENGTH, 160, 72, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, Z_NEAR - LENGTH / 2);

    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uRows: { value: ROWS_ON_TUBE },
      uOffset: { value: 0 },
      uTime: { value: 0 },
      uFar: { value: LENGTH * 0.92 },
      uInk: { value: cssColor("--sys-fg", "#edebe4") },
      uAccent: { value: cssColor("--signal", "#39ff5a") },
      uBg: { value: cssColor("--sys-bg", "#0b0b0a") },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, side: THREE.BackSide });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = { offset: 0, vel: 0, mx: 0, my: 0, tx: 0, ty: 0, dragging: false, lastX: 0 };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      // On narrow screens look straight down the tube; on wide screens turn
      // the camera so the vanishing point sits right of centre.
      const wide = w >= 900;
      camera.fov = wide ? 58 : 70;
      camera.updateProjectionMatrix();
      baseYaw = wide ? 0.2 : 0.02;
    };
    let baseYaw = 0.2;

    const frame = (dt: number, now: number) => {
      if (!reduce.matches) {
        state.offset += (0.012 + state.vel) * dt;
        state.vel *= Math.exp(-dt * 2.5);
      }
      state.mx += (state.tx - state.mx) * Math.min(1, dt * 3);
      state.my += (state.ty - state.my) * Math.min(1, dt * 3);
      camera.rotation.y = baseYaw - state.mx * 0.06;
      camera.rotation.x = -0.13 + state.my * 0.04;
      uniforms.uOffset.value = state.offset;
      uniforms.uTime.value = now / 1000;
      renderer.render(scene, camera);
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      frame(dt, now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches || document.hidden) {
        frame(0, performance.now());
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      state.tx = e.clientX / window.innerWidth - 0.5;
      state.ty = e.clientY / window.innerHeight - 0.5;
      if (state.dragging) {
        state.vel += ((e.clientX - state.lastX) / window.innerWidth) * 0.9;
        state.lastX = e.clientX;
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a, button, input, textarea, select, [data-no-drag]")) return;
      state.dragging = true;
      state.lastX = e.clientX;
      document.documentElement.style.userSelect = "none";
    };
    const onUp = () => {
      state.dragging = false;
      document.documentElement.style.userSelect = "";
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("visibilitychange", play);
    reduce.addEventListener("change", play);
    cleanups.push(() => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", play);
      reduce.removeEventListener("change", play);
    });

    resize();
    const family = getComputedStyle(document.body).getPropertyValue("--font-neue-machina").trim() || "sans-serif";
    buildTexture(rows, family).then((tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      uniforms.uTex.value = tex;
      cleanups.push(() => tex.dispose());
      play();
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [rows]);

  return <div ref={hostRef} aria-hidden className={className ?? "fixed inset-0 -z-10"} />;
}
