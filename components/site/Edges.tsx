"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";

/**
 * Colours for the browser chrome at the top and bottom of the page.
 *
 * Mobile Safari tints its status bar and bottom toolbar from what sits at
 * the screen edges (newer versions read fixed elements there and the
 * document backgrounds; older ones and other browsers read theme-color).
 * So two thin fixed strips sit at the edges, and each takes the colour of
 * whatever is just inside it: the black jhalar rail or bumper when they
 * meet the edge, otherwise the section ground.
 *
 * The pair is worked out once per frame and the same two values go to the
 * strips (via --edge-top-background / --edge-bottom-background), the html
 * and body backgrounds, and the theme-color meta tag.
 *
 * Bands that should colour an edge carry data-edge="<colour>".
 */

type Edges = { top: string; bottom: string };

const FADE_MS = 400; // matches the Shell's ground crossfade
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function colourAt(root: HTMLElement, y: number, ground: string) {
  for (const el of root.querySelectorAll<HTMLElement>("[data-edge]")) {
    const r = el.getBoundingClientRect();
    if (y >= r.top && y < r.bottom) return el.dataset.edge || ground;
  }
  return ground;
}

export default function EdgeStrips({ ground, rootRef }: { ground: string; rootRef: RefObject<HTMLElement> }) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef(ground);
  const scheduleRef = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Everything we touch on the shared document, so leaving puts it back.
    const saved = {
      top: html.style.getPropertyValue("--edge-top-background"),
      bottom: html.style.getPropertyValue("--edge-bottom-background"),
      htmlBg: html.style.backgroundColor,
      bodyBg: body.style.backgroundColor,
    };
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const savedMeta = meta.content;
    html.setAttribute("data-edges", "");

    let last: Edges | null = null;
    let lastGround = "";
    let raf = 0;
    let fadeTimer = 0;

    const measure = (): Edges | null => {
      const root = rootRef.current;
      const top = topRef.current;
      const bottom = bottomRef.current;
      if (!root || !top || !bottom) return null;
      const g = groundRef.current;
      // Rubber-banding drags the page past its ends; follow it so the
      // colour doesn't flicker on every bounce.
      const y = window.scrollY;
      const maxY = html.scrollHeight - window.innerHeight;
      const yTop = top.getBoundingClientRect().bottom - Math.min(0, y);
      const yBottom = bottom.getBoundingClientRect().top - 1 - Math.max(0, y - maxY);
      return { top: colourAt(root, yTop, g), bottom: colourAt(root, yBottom, g) };
    };

    const apply = (e: Edges) => {
      // A new ground crossfades with the page; scrolling past a band snaps.
      const fade = lastGround !== "" && lastGround !== groundRef.current;
      lastGround = groundRef.current;
      window.clearTimeout(fadeTimer);
      if (fade) {
        html.setAttribute("data-edge-fade", "");
        fadeTimer = window.setTimeout(() => html.removeAttribute("data-edge-fade"), FADE_MS);
      } else html.removeAttribute("data-edge-fade");

      html.style.setProperty("--edge-top-background", e.top);
      html.style.setProperty("--edge-bottom-background", e.bottom);
      html.style.backgroundColor = e.top;
      body.style.backgroundColor = e.bottom;
      meta!.content = e.top;
    };

    const update = () => {
      raf = 0;
      const e = measure();
      if (!e) return;
      if (last && last.top === e.top && last.bottom === e.bottom && lastGround === groundRef.current) return;
      last = e;
      apply(e);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    scheduleRef.current = schedule;

    // Scrolling (including a restored position), the window or the visual
    // viewport resizing (Safari's toolbar expanding and collapsing), a
    // bfcache restore, and the page itself changing height.
    const vv = window.visualViewport;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    window.addEventListener("load", schedule);
    vv?.addEventListener("resize", schedule);
    vv?.addEventListener("scroll", schedule);
    const ro = new ResizeObserver(schedule);
    if (rootRef.current) ro.observe(rootRef.current);
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fadeTimer);
      scheduleRef.current = () => {};
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      window.removeEventListener("load", schedule);
      vv?.removeEventListener("resize", schedule);
      vv?.removeEventListener("scroll", schedule);
      ro.disconnect();

      html.style.setProperty("--edge-top-background", saved.top);
      html.style.setProperty("--edge-bottom-background", saved.bottom);
      html.style.backgroundColor = saved.htmlBg;
      body.style.backgroundColor = saved.bodyBg;
      html.removeAttribute("data-edges");
      html.removeAttribute("data-edge-fade");
      if (createdMeta) meta!.remove();
      else meta!.content = savedMeta;
    };
  }, [rootRef]);

  // A new section ground: recolour straight away.
  useIsoLayoutEffect(() => {
    groundRef.current = ground;
    scheduleRef.current();
  }, [ground]);

  // Until the effect runs, the bottom strip falls back to the ground
  // (the top one to the rail), which is what a fresh load shows.
  return (
    <>
      <div ref={topRef} aria-hidden className="edge-top" />
      <div ref={bottomRef} aria-hidden className="edge-bottom" style={{ "--edge-ground": ground } as CSSProperties} />
    </>
  );
}
