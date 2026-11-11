"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen dithered horizon. Rendered at 1/PIXEL of the viewport and
 * upscaled with nearest-neighbour sampling, so every dither cell is a crisp
 * PIXEL×PIXEL square and the fragment shader stays cheap.
 *
 * The sun's position follows `hour` (0–24, the visitor's local time).
 */

const PIXEL = 3;
const FPS = 30;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uHour;
uniform vec2 uMouse;
out vec4 outColor;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 uv = fc / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  float t = uTime;

  // Sun elevation: -1 at midnight, +1 at noon. Dusk/dawn sit near 0.
  float e = -cos(uHour / 24.0 * 6.2831853);
  float day = smoothstep(-0.15, 0.65, e);
  float dusk = exp(-e * e * 9.0);

  // The horizon is the limb of a huge planet whose centre sits off-screen,
  // bottom right, so it reads as a curved diagonal.
  vec2 c = vec2(0.25 * aspect + 0.03 * sin(t * 0.017), -2.8);
  float R = 2.5;
  float d = length(p - c) - R;              // > 0 sky, < 0 planet
  float ang = atan(p.y - c.y, p.x - c.x);
  float along = ang * R;

  vec3 zenith = mix(vec3(0.010, 0.012, 0.030), vec3(0.11, 0.24, 0.52), day);
  vec3 haze   = mix(vec3(0.05, 0.07, 0.20), vec3(0.55, 0.70, 0.90), day);
  vec3 band   = mix(vec3(0.30, 0.22, 0.75), vec3(1.00, 0.36, 0.08), dusk);
  band        = mix(band, vec3(1.00, 0.86, 0.70), day * (1.0 - dusk));
  vec3 core   = vec3(1.0, 0.92, 0.80);

  float streak = fbm(vec2(along * 3.0 - t * 0.012, d * 22.0));
  float streak2 = fbm(vec2(along * 9.0 + t * 0.02, d * 60.0 + 3.0));

  vec3 col;
  if (d > 0.0) {
    col = mix(haze, zenith, smoothstep(0.0, 0.85, d));
    col += band * exp(-d / 0.085) * (0.45 + 0.75 * streak);
    col += band * exp(-d / 0.022) * 0.5 * streak2;
    // Stars fade in at night, away from the glow.
    float s = hash(floor(fc));
    col += vec3(step(0.9965, s)) * (1.0 - day) * smoothstep(0.08, 0.35, d) * 0.9;
  } else {
    vec3 ground = mix(vec3(0.012, 0.010, 0.012), vec3(0.06, 0.06, 0.08), day);
    col = ground * (0.7 + 0.6 * fbm(vec2(along * 4.0, d * 8.0)));
    col += band * exp(d / 0.018) * (0.6 + 0.4 * streak2);
  }
  col += core * exp(-abs(d) / 0.0055) * (0.55 + 0.45 * streak2);

  // Faint light that follows the cursor.
  vec2 m = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);
  col += band * 0.07 * exp(-dot(p - m, p - m) / 0.03);

  // Keep the edges dark so text stays legible.
  vec2 v = uv - 0.5;
  col *= 1.0 - 0.55 * dot(v, v);

  // Faint per-pixel RGB speckle, then an ordered dither per channel. The
  // dither runs in sqrt space so the darkest step is a dim 16/255 rather
  // than a bright dot, which keeps the night sky quiet behind text.
  vec3 speckle = vec3(hash(fc + 0.1), hash(fc + 1.7), hash(fc + 3.3)) - 0.5;
  col += speckle * 0.025;
  float L = 4.0;
  vec3 q = floor(sqrt(clamp(col, 0.0, 1.0)) * L + bayer8(fc)) / L;
  col = q * q;

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function ShaderSky({ hour }: { hour: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hourRef = useRef(hour);
  const [failed, setFailed] = useState(false);

  hourRef.current = hour;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) { setFailed(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) { setFailed(true); return; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uHour = gl.getUniformLocation(prog, "uHour");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let raf = 0;
    let last = 0;
    const start = performance.now();

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / PIXEL);
      canvas.height = Math.ceil(window.innerHeight / PIXEL);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uHour, hourRef.current);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    const play = () => {
      cancelAnimationFrame(raf);
      if (reduce.matches || document.hidden) draw(performance.now());
      else raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    const onResize = () => { resize(); draw(performance.now()); };

    resize();
    play();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", play);
    reduce.addEventListener("change", play);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", play);
      reduce.removeEventListener("change", play);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  if (failed) {
    return (
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{ background: "linear-gradient(160deg, #05060d 0%, #0d1233 55%, #3a1a10 72%, #050505 80%)" }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ imageRendering: "pixelated", background: "#0b0b0a" }}
    />
  );
}
