"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * An underline in `colour` that draws itself left to right, across line
 * breaks, the first time the phrase scrolls into view. With reduced motion
 * it's simply there.
 */
export default function DrawUnderline({ colour, children }: { colour: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    // Draw once the phrase is comfortably on screen, not at the very edge.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className="text-ink [box-decoration-break:slice]"
      style={{
        backgroundImage: `linear-gradient(${colour}, ${colour})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 calc(100% - 1px)",
        backgroundSize: drawn ? "100% 2px" : "0% 2px",
        transition: "background-size 900ms cubic-bezier(0.22, 1, 0.36, 1)",
        paddingBottom: 3,
      }}
    >
      {children}
    </span>
  );
}
