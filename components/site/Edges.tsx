"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";

/**
 * Colours for the browser chrome at the top and bottom of the page.
 *
 * Mobile Safari tints its status bar and bottom toolbar from what sits at
 * the screen edges (newer versions read fixed elements there and the
 * document backgrounds; older ones and other browsers read theme-color).
 * So two thin fixed strips sit at the edges: the top in the page's ground,
 * the bottom in the bumper's black.
 *
 * The values go to the strips (via --edge-top-background /
 * --edge-bottom-background), the body (bottom), the theme-color meta tag
 * (top), and the html background, which is what Safari shows when you
 * pull past either end of the page. That one follows the direction you
 * last scrolled: heading down it's the bottom colour, so the bounce below
 * the bumper carries on its black; heading up it's the top colour, so the
 * bounce above the jhalar is ground. Direction comes from the wheel and
 * touch as well as scroll events, because on a page that fits the screen,
 * and in Chrome, rubber-banding never changes scrollY.
 */

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function EdgeStrips({ top, bottom }: { top: string; bottom: string }) {
  const applyRef = useRef<(top: string, bottom: string) => void>(() => {});

  // Everything we touch on the shared document, so leaving puts it back.
  useIsoLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const saved = {
      top: html.style.getPropertyValue("--edge-top-background"),
      bottom: html.style.getPropertyValue("--edge-bottom-background"),
      htmlBg: html.style.backgroundColor,
      bodyBg: body.style.backgroundColor,
    };
    // Looked up each time: Next swaps its own tag in on client navigation.
    const findMeta = () => document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    const savedMeta = findMeta()?.content;
    let created: HTMLMetaElement | null = null;
    let current = "";
    let under = { top: "", bottom: "" };
    html.setAttribute("data-edges", "");

    let down = false;
    let painted = "";
    const paintUnder = () => {
      const colour = down ? under.bottom : under.top;
      if (colour && colour !== painted) html.style.backgroundColor = painted = colour;
    };
    const heading = (d: boolean) => {
      down = d;
      paintUnder();
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) heading(y > lastY);
      lastY = y;
    };
    const onWheel = (e: WheelEvent) => e.deltaY && heading(e.deltaY > 0);
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? 0);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      // A finger moving up scrolls the page down.
      if (Math.abs(y - touchY) > 2) heading(y < touchY);
      touchY = y;
    };
    const opts = { passive: true } as const;
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, opts);
    window.addEventListener("touchmove", onTouchMove, opts);

    const setMeta = () => {
      let meta = findMeta();
      if (!meta) {
        meta = created = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      if (meta.content !== current) meta.content = current;
    };
    // Next re-adds its static tag a beat after each navigation commits;
    // put the live colour back on whichever tag is there.
    const mo = new MutationObserver(() => current && setMeta());
    mo.observe(document.head, { childList: true });

    applyRef.current = (t, b) => {
      current = t;
      html.style.setProperty("--edge-top-background", t);
      html.style.setProperty("--edge-bottom-background", b);
      body.style.backgroundColor = b;
      under = { top: t, bottom: b };
      paintUnder();
      setMeta();
    };

    return () => {
      applyRef.current = () => {};
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      html.style.setProperty("--edge-top-background", saved.top);
      html.style.setProperty("--edge-bottom-background", saved.bottom);
      html.style.backgroundColor = saved.htmlBg;
      body.style.backgroundColor = saved.bodyBg;
      html.removeAttribute("data-edges");
      created?.remove();
      const meta = findMeta();
      if (meta && savedMeta !== undefined) meta.content = savedMeta;
    };
  }, []);

  useIsoLayoutEffect(() => applyRef.current(top, bottom), [top, bottom]);

  // --edge-fallback paints each strip until the document vars are set.
  return (
    <>
      <div aria-hidden className="edge-top" style={{ "--edge-fallback": top } as CSSProperties} />
      <div aria-hidden className="edge-bottom" style={{ "--edge-fallback": bottom } as CSSProperties} />
    </>
  );
}
