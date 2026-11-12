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
import { STAR_PITCH, starRowStyle } from "@/components/site/Ornament";
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
  const latticeInk =
    tone?.lattice ?? (caseGround ? mixHex(caseGround, COMPANY[slug] ?? DEFAULT_PLATE, 0.4) : theme.lattice);

  // Drop any hover tint left over from the page we just left.
  useEffect(() => setTint(null), [path]);

  // Sound: off until turned on; a soft tick on any link or button.
  const [sound, setSoundState] = useState(false);
  useEffect(() => {
    const off = onSoundChange(setSoundState);
    initSound();
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) tick();
    };
    document.addEventListener("click", onClick);
    return () => {
      off();
      document.removeEventListener("click", onClick);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? path === "/" || path.startsWith("/projects") : path.startsWith(href);

  // The nav underline: a row of stars that glides to the current item,
  // a whole number of stars wide and centred under the label. Until it
  // has been measured (server render, first paint) it sits inside the
  // active link instead, in the same spot, so there's no flash.
  const activeHref = NAV.find((n) => isActive(n.href))?.href;
  const activeRef = useRef(activeHref);
  activeRef.current = activeHref;
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [star, setStar] = useState<{ x: number; y: number; w: number; on: boolean; glide: boolean } | null>(null);
  const placeStar = useCallback((glide: boolean) => {
    const href = activeRef.current;
    const el = href ? linkRefs.current[href] : null;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStar((prev) => {
      if (!el) return prev && { ...prev, on: false, glide: false };
      const w = Math.max(1, Math.floor(el.offsetWidth / STAR_PITCH)) * STAR_PITCH;
      return {
        x: Math.round(el.offsetLeft + (el.offsetWidth - w) / 2),
        y: el.offsetTop + el.offsetHeight + 2,
        w,
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
    backgroundImage: `radial-gradient(${theme.dot} 0.9px, transparent 1.3px)`,
    backgroundSize: "4px 4px",
    // Clear of the fixed edge strips (and so the notch and home indicator).
    paddingTop: "var(--edge-top-h)",
    paddingBottom: "var(--edge-bottom-h)",
    // The type lab can swap these via --site-font.
    fontFamily: "var(--site-font, var(--font-geist))",
    transition: "background-color 400ms ease-out, color 400ms ease-out",
  } as CSSProperties;

  return (
    <ShellContext.Provider value={{ setTint, setTone }}>
      <main className="relative isolate flex min-h-[100svh] flex-col text-ink antialiased" style={vars}>
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
                {active && !star && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-[calc(100%+2px)] -translate-x-1/2"
                    style={{ ...starRowStyle("var(--ink)"), width: `round(down, 100%, ${STAR_PITCH}px)` }}
                  />
                )}
                {n.label}
              </Link>
            );
          })}
          {star && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0"
              style={{
                ...starRowStyle("var(--ink)"),
                width: star.w,
                transform: `translate(${star.x}px, ${star.y}px)`,
                opacity: star.on ? 1 : 0,
                // The ink fades with the lettering when the section changes.
                transition: star.glide
                  ? "transform 220ms cubic-bezier(0.23, 1, 0.32, 1), width 220ms cubic-bezier(0.23, 1, 0.32, 1), background-color 300ms ease"
                  : "background-color 300ms ease",
              }}
            />
          )}
          <button
            type="button"
            onClick={() => setSound(!sound)}
            aria-pressed={sound}
            className="ml-auto text-[14px] text-ink-3 outline-none transition-colors duration-150 ease-out hover:text-ink focus-visible:underline"
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

        <Bumper />
      </main>
      {/* Outside main (and any transformed ancestor) so they stay fixed to the viewport. */}
      {/* Top in the ground; bottom carries on the bumper's black. */}
      <EdgeStrips top={ground} bottom={BLACK} />
    </ShellContext.Provider>
  );
}
