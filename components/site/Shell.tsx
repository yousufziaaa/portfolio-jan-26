"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import GeoField from "@/components/site/GeoField";
import EdgeStrips from "@/components/site/Edges";
import { SHOW_WRITING } from "@/lib/flags";
import { StarMark } from "@/components/site/Ornament";
import { navFace, navType } from "@/components/site/type";
import { BLACK, Bumper, Jhalar } from "@/components/site/TruckArt";
import { initSound, onSoundChange, setSound, tick } from "@/components/site/sound";
import { CASE_GROUND, COMPANY, DEFAULT_PLATE, PATTERN, THEMES, mixHex, themeFor, type Section } from "@/components/site/palette";

/**
 * The shell every public page sits in, mounted once in app/(site)/layout:
 * a flat poster ground with a halftone screen, the star lattice woven into
 * it, a truck-art jhalar on top and a painted bumper below, the nav, and
 * one narrow column.
 *
 * Each section has its own ground (work green, writing sky, lab rose,
 * about plum) and the colour fades as you move between them.
 */

const NAV = [
  { href: "/", label: "Home" },
  ...(SHOW_WRITING ? [{ href: "/writing", label: "Writing" }] : []),
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
];

// The nav underline's stars: size, gap, and enough for the longest label.
const STAR = 7;
const STAR_GAP = 3;
const STAR_PITCH = STAR + STAR_GAP;
const STAR_MAX = 8;
const GLIDE = "280ms cubic-bezier(0.23, 1, 0.32, 1)";

// useLayoutEffect warns during server rendering; this is the usual dodge.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Tone = { lattice: string; ground?: string };
type Ctx = { setTint: (c: string | null) => void; setTone: (t: Tone | null) => void };
const ShellContext = createContext<Ctx>({ setTint: () => {}, setTone: () => {} });

/** Handlers that light the lattice in `colour` while hovered or focused. */
export function useTintHandlers() {
  const { setTint } = useContext(ShellContext);
  return useCallback(
    (colour: string) => ({
      onMouseEnter: () => setTint(colour),
      onMouseLeave: () => setTint(null),
      onFocus: () => setTint(colour),
      onBlur: () => setTint(null),
    }),
    [setTint],
  );
}

/** While mounted, give the lattice its own stroke colour (and optionally the page its own ground). */
export function LatticeTone({ colour, ground }: { colour: string; ground?: string }) {
  const { setTone } = useContext(ShellContext);
  useEffect(() => {
    setTone({ lattice: colour, ground });
    return () => setTone(null);
  }, [colour, ground, setTone]);
  return null;
}

export default function Shell({
  children,
  section,
  pattern,
}: {
  children: ReactNode;
  /** Overrides for the type lab; normally the URL picks both. */
  section?: Section;
  pattern?: number;
}) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [tint, setTint] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);
  const path = usePathname();
  const current = section ?? themeFor(path);
  const theme = THEMES[current];
  // Case studies take a deep shade of their brand, worked out from the URL
  // during render so a direct visit doesn't flash the default ground.
  const slug = !section && path.startsWith("/projects/") ? path.split("/")[2] : "";
  const caseGround = CASE_GROUND[slug];
  const ground = tone?.ground ?? caseGround ?? theme.bg;
  // Only the home page ends on the painted bumper; every other page runs
  // out in its own ground, browser chrome included. (The type lab shows
  // it whenever it's previewing the home section.)
  const bumper = section ? section === "work" : path === "/";
  const latticeInk =
    tone?.lattice ?? (caseGround ? mixHex(caseGround, COMPANY[slug] ?? DEFAULT_PLATE, 0.4) : theme.lattice);

  // Drop any hover tint left over from the page we just left.
  useEffect(() => setTint(null), [path]);

  // Sound: off until turned on; a soft tick on any link or button.
  const [sound, setSoundState] = useState(false);
  useEffect(() => {
    const off = onSoundChange(setSoundState);
    initSound();
    // The sound toggle plays its own tick when it turns sound on.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a, button");
      if (el && !el.hasAttribute("data-own-sound")) tick();
    };
    document.addEventListener("click", onClick);
    return () => {
      off();
      document.removeEventListener("click", onClick);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? path === "/" || path.startsWith("/projects") : path.startsWith(href);

  // The nav underline: as many stars as fit under the current label,
  // centred, gliding over to the next item. Until it has been measured
  // (server render, first paint) it sits inside the active link instead,
  // in the same spot, so there's no flash.
  const activeHref = NAV.find((n) => isActive(n.href))?.href;
  const activeRef = useRef(activeHref);
  activeRef.current = activeHref;
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [star, setStar] = useState<{
    x: number;
    y: number;
    n: number;
    dir: number;
    on: boolean;
    glide: boolean;
  } | null>(null);
  const placeStar = useCallback((glide: boolean) => {
    const href = activeRef.current;
    const el = href ? linkRefs.current[href] : null;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStar((prev) => {
      if (!el) return prev && { ...prev, on: false, glide: false };
      const n = Math.min(STAR_MAX, Math.max(1, Math.floor((el.offsetWidth + STAR_GAP) / STAR_PITCH)));
      const x = Math.round(el.offsetLeft + (el.offsetWidth - (n * STAR_PITCH - STAR_GAP)) / 2);
      return {
        x,
        y: el.offsetTop + el.offsetHeight + 2,
        n,
        dir: prev && x < prev.x ? -1 : 1,
        on: true,
        glide: glide && !still && !!prev?.on,
      };
    });
  }, []);
  useIsoLayoutEffect(() => placeStar(true), [activeHref, placeStar]);
  // Re-measure, without gliding, when the nav's size or font changes.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => placeStar(false));
    ro.observe(nav);
    document.fonts?.ready.then(() => placeStar(false));
    return () => ro.disconnect();
  }, [placeStar]);

  const vars = {
    "--ink": theme.ink,
    "--ink-2": `color-mix(in srgb, ${theme.ink} 92%, transparent)`,
    "--ink-3": `color-mix(in srgb, ${theme.ink} 70%, transparent)`,
    "--rule": `color-mix(in srgb, ${theme.ink} 28%, transparent)`,
    // Older prose styles read these.
    "--header": theme.ink,
    "--foreground": theme.ink,
    backgroundColor: ground,
    // Clear of the fixed strips (and so the notch and home indicator). With
    // the bumper, the bottom strip's room is part of it instead, below.
    paddingTop: "var(--edge-top-h)",
    paddingBottom: bumper ? 0 : "var(--edge-bottom-h)",
    // The type lab can swap these via --site-font.
    fontFamily: "var(--site-font, var(--font-geist))",
    transition: "background-color 400ms ease-out, color 400ms ease-out",
    // Under the bumper the bounce gap is black, so keep the fixed lattice
    // canvas inside the page there. Elsewhere the gap is the page's own
    // ground and the lattice carries on into it.
    clipPath: bumper ? "inset(0)" : undefined,
  } as CSSProperties;

  return (
    <ShellContext.Provider value={{ setTint, setTone }}>
      <main className="relative isolate flex min-h-[100svh] flex-col text-ink antialiased" style={vars}>
        {/* The halftone screen, fixed to the screen like the lattice (the page
            scrolls over both), so it also fills the gap when the page
            rubber-bands past either end. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ backgroundImage: `radial-gradient(${theme.dot} 0.9px, transparent 1.3px)`, backgroundSize: "4px 4px" }}
        />
        <GeoField
          mode="lattice"
          ink={latticeInk}
          pattern={pattern ?? PATTERN[current]}
          colour={tint ?? DEFAULT_PLATE}
          tint={!!tint}
          columnRef={columnRef}
        />
        <Jhalar />

        {/* A row above the column, lined up with its text. It lives in the
            persistent shell at a fixed spot, so it never moves between pages. */}
        <nav
          ref={navRef}
          aria-label="Site"
          className={`absolute z-20 flex items-baseline gap-[30px] ${navType}`}
          // Set in the title face so the nav and the name read as one sign;
          // kept inside the safe area in landscape.
          style={{
            ...navFace,
            top: "calc(54px + var(--edge-top-h))",
            left: "max(24px, env(safe-area-inset-left), 50% - 236px)",
            right: "max(24px, env(safe-area-inset-right), 50% - 236px)",
          }}
        >
          {NAV.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                ref={(el) => {
                  linkRefs.current[n.href] = el;
                }}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative underline-offset-[5px] outline-none transition-colors duration-150 ease-out focus-visible:underline ${
                  active ? "text-ink" : "text-ink-3 hover:text-ink"
                }`}
              >
                {/* Hangs below the label so nothing shifts between pages. */}
                {/* Stars that don't fit wrap onto a hidden second line. */}
                {active && !star && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-[calc(100%+2px)] flex flex-wrap justify-center overflow-hidden"
                    style={{ height: STAR, columnGap: STAR_GAP }}
                  >
                    {Array.from({ length: STAR_MAX }, (_, i) => (
                      <StarMark key={i} colour="var(--ink)" size={STAR} />
                    ))}
                  </span>
                )}
                {n.label}
              </Link>
            );
          })}
          {/* Each star glides on its own (transform and opacity only, so it
              stays smooth while the next page renders). The one on the side
              we're heading leads and the rest follow a beat apart; stars the
              next label doesn't need shrink into the last one. */}
          {star &&
            Array.from({ length: STAR_MAX }, (_, i) => {
              const shown = i < star.n;
              const slot = Math.min(i, star.n - 1);
              const order = star.dir > 0 ? star.n - 1 - slot : slot;
              return (
                <span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute left-0 top-0 flex"
                  style={{
                    transform: `translate(${star.x + slot * STAR_PITCH}px, ${star.y}px) scale(${shown ? 1 : 0.3})`,
                    opacity: star.on && shown ? 1 : 0,
                    transition: star.glide
                      ? `transform ${GLIDE} ${order * 18}ms, opacity 180ms ease-out ${order * 18}ms`
                      : "none",
                  }}
                >
                  <StarMark colour="var(--ink)" size={STAR} />
                </span>
              );
            })}
          <button
            type="button"
            onClick={() => setSound(!sound)}
            aria-pressed={sound}
            data-own-sound
            className="ml-auto whitespace-nowrap text-[14px] text-ink-3 outline-none transition-colors duration-150 ease-out hover:text-ink focus-visible:underline"
          >
            Sound {sound ? "on" : "off"}
          </button>
        </nav>

        <div className="flex-1 pt-[52px]">
          <div
            ref={columnRef}
            className="mx-auto w-full max-w-[520px] pb-14 pt-[clamp(28px,6svh,64px)]"
            style={{
              paddingLeft: "max(24px, env(safe-area-inset-left))",
              paddingRight: "max(24px, env(safe-area-inset-right))",
            }}
          >
            {children}
          </div>
        </div>

        {/* The bumper's black runs on under the fixed bottom strip (and the
            home indicator), so nothing green shows between them when the
            page rubber-bands. */}
        {bumper && (
          <div className="shrink-0" style={{ backgroundColor: BLACK, paddingBottom: "var(--edge-bottom-h)" }}>
            <Bumper />
          </div>
        )}
      </main>
      {/* Outside main (and any transformed ancestor) so they stay fixed to the viewport. */}
      {/* Top in the ground; bottom carries on the bumper's black, or the
          ground where there's no bumper. */}
      <EdgeStrips top={ground} bottom={bumper ? BLACK : ground} />
    </ShellContext.Provider>
  );
}
