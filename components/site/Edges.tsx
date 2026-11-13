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
 * pull past either end of the page. That one swaps with scroll position:
 * the top colour in the upper half, so the bounce above the jhalar is
 * ground, and the bottom in the lower half, so the bounce below the
 * bumper carries on its black.
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

    // Past halfway, or rubber-banding past the end (scrollY beyond max),
    // the next bounce will be at the bottom.
    let painted = "";
    const paintUnder = () => {
      const max = html.scrollHeight - window.innerHeight;
      const colour = window.scrollY > max / 2 ? under.bottom : under.top;
      if (colour && colour !== painted) html.style.backgroundColor = painted = colour;
    };
    window.addEventListener("scroll", paintUnder, { passive: true });
    window.addEventListener("resize", paintUnder);
    window.addEventListener("pageshow", paintUnder);

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
      window.removeEventListener("scroll", paintUnder);
      window.removeEventListener("resize", paintUnder);
      window.removeEventListener("pageshow", paintUnder);
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
